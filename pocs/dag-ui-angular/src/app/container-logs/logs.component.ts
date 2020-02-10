import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { LogsService } from "./logs.service";
import { NodeStatus } from "../node/node.service";
import { AceEditorComponent } from "ng2-ace-editor";

@Component({
  selector: 'app-logs',
  templateUrl: './logs.component.html',
  styleUrls: ['./logs.component.scss'],
  providers: [LogsService]
})
export class LogsComponent implements OnInit, OnDestroy {
  private _aceEditor;
  @ViewChild(AceEditorComponent, {static:false}) set aceEditor(aceEditor: AceEditorComponent) {
    this._aceEditor = aceEditor;

    if(aceEditor) {
      aceEditor.getEditor().session.on('changeScrollTop', (e) => {
        // Ignore scrolling above the scroll area.
        if (e < 0) {
          return;
        }

        if(this.lastScroll) {
         this.onScrollChange(e, this.lastScroll);
        }

        this.lastScroll = e;
      });
    }
  }

  get aceEditor(): AceEditorComponent {
    return this._aceEditor;
  }

  @Input() namespace: string;
  @Input() workflowName: string;
  @Input() podId: string;
  @Output() closeClicked = new EventEmitter();

  private _nodeInfo;
  @Input() set nodeInfo(value: NodeStatus) {
    this._nodeInfo = value;

    if (value.phase === 'Running' || value.phase === 'Succeeded') {
      this.information = '';
      this.getLogs();
    } else if(value.phase === 'Failed') {
      this.loading = false;
      this.information = 'Node failed';
      this.getLogs();
    } else if(value.phase === 'Error') {
      this.loading = false;
      this.information = 'Node error';
    } else {
      this.information = 'Node is not running yet';
      this.loading = true;
    }
  }
  get nodeInfo(): NodeStatus {
    return this._nodeInfo;
  }

  // Socket to the streaming logs
  private socket: WebSocket;

  // The Node ID this component is currently getting logs for.
  // The Node Info may be updated several times, and it may refer to the same node.
  // This keeps track of the one we are currently looking at so we can avoid duplicate logic like
  // getting logs twice, etc.
  private gettingLogsForNodeId: string;

  // The text displayed in the log.
  logText = '';

  // True if logs are loading data, false otherwise.
  loading = true;

  // The text displayed in the information section of the toolbar.
  information = '';

  // Last scroll position. Bookkeeping variable to track scroll amounts.
  lastScroll: number;

  // If true, the UI should scroll the user to the bottom as more log data is added.
  scrollToBottom = true;

  constructor(private logsService: LogsService) { }

  ngOnInit(): void {
  }

  getLogs() {
    if(this.gettingLogsForNodeId && this.gettingLogsForNodeId === this.nodeInfo.id) {
      return;
    }

    this.gettingLogsForNodeId = this.nodeInfo.id;

    // We're switching to a new node/logs provider.
    // Clean up the old socket if there was one.
    if (this.socket) {
      this.socket.close();
    }

    // Clean up the log text as the new node/logs provider will have new logs.
    this.logText = '';

    this.socket = this.logsService.getPodLogsSocket(this.namespace, this.workflowName, this.podId);

    this.socket.onmessage = (event: any) => {
      try {
        const jsonData = JSON.parse(event.data);

        if(jsonData.result && jsonData.result.content) {
          this.logText += jsonData.result.content + '\n';

          this.onLogsUpdated();
        }

      } catch (e) {
        console.error(e);
      }
    };

    this.socket.onclose = (event) => {
      this.loading = false;
      if (this.logText === '') {
        this.information = 'No logs generated';
      }
    };
  }

  ngOnDestroy(): void {
    if (this.socket) {
      this.socket.close();
    }
  }

  onCloseClick() {
    this.closeClicked.emit();
  }

  onScrollChange(newScrollPosition: number, oldScrollPosition: number) {
    const diff = newScrollPosition - oldScrollPosition;

    // Ignore scrolling in 'place' and if we scroll up by a large amount (-50 here), ignore that
    // as it is probably the system scrolling us automatically up to the last line if we overscrolled.
    // This is not a good detection method, and should be updated.
    if(diff !== 0 && (diff > -50) ) {
      const scrollingUp = diff < 0;

      // When we scroll up, stop the automatic scrolling to the bottom of the logs.
      if (scrollingUp) {
        this.scrollToBottom = false;
      } else { // Scrolling down
        const lastVisibleRow = this.aceEditor.getEditor().getLastVisibleRow();
        const totalRows = this.aceEditor.getEditor().session.getLength();
        const rowsFromBottom = totalRows - lastVisibleRow;

        if(rowsFromBottom < 10) {
          this.scrollToBottom = true;
        }
      }
    }
  }

  editorHasLessContentThanScreenAllows(): boolean {
    if (!this.aceEditor) {
      return false;
    }

    const editor = this.aceEditor.getEditor();

    const totalRows = editor.session.getLength();
    const lastVisibleRow = editor.getLastVisibleRow();

    return lastVisibleRow == totalRows
  }

  onLogsUpdated() {
    this.scrollToBottomIfNeeded();
  }

  /**
   * Scrolls to the bottom of the logs content if
   * 1. There is more log content than visible.
   * 2. The scrollToBottom variable is true.
   */
  scrollToBottomIfNeeded() {
    if (!this.aceEditor) {
      return;
    }

    if(this.editorHasLessContentThanScreenAllows()) {
      return;
    }

    if(!this.scrollToBottom) {
      return;
    }

    const numberLines = this.aceEditor.getEditor().session.getDocument().getLength();
    const goToLine = Math.max(numberLines, 0);
    this.aceEditor.getEditor().scrollToLine(goToLine, true, true, () => {});
  }
}
