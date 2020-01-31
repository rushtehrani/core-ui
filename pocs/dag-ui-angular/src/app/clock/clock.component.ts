import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Duration } from "../duration/Duration";

/**
 * Displays an incrementing time given a start Date.
 * If a finished Date is provided, the clock stops incrementing.
 */
@Component({
  selector: 'app-clock',
  templateUrl: './clock.component.html',
  styleUrls: ['./clock.component.scss']
})
export class ClockComponent implements OnInit, OnDestroy {
  private timer = null;
  private _startedAt: Date;
  private _finishedAt: Date;

  @Input() set startedAt(value: string|Date|null) {
    if(!value) {
      return;
    }

    if(typeof(value) === 'string') {
      this._startedAt = new Date(value);
    } else {
      this._startedAt = value;
    }
  }

  @Input() set finishedAt(value: string|Date|null) {
    if(!value) {
      return
    }

    if(typeof(value) === 'string') {
      this._finishedAt = new Date(value);
    } else {
      this._finishedAt = value;
    }

    this.clearTimer();
    this.updateDuration(this._finishedAt);
  }

  /**
   * The default string to display when there is no valid data.
   */
  @Input() defaultString: string = '00:00';

  /**
   * How often to update the clock - in milliseconds.
   * Defaults to 1 second (1000ms)
   */
  @Input() interval = 1000;

  durationString = this.defaultString;
  durationFormatter = Duration.formatDuration;

  constructor() { }

  ngOnInit() {
    if(this._finishedAt) {
      this.updateDuration(this._finishedAt);
      return;
    }

    this.timer = setInterval(() => {
      this.updateDuration(new Date());
    }, this.interval)
  }

  private clearTimer() {
    if(this.timer) {
      clearInterval(this.timer);
    }
  }

  private updateDuration(finishedAt: Date) {
    if(!this._startedAt) {
      this.durationString = this.defaultString;
      return;
    }

    this.durationString = this.durationFormatter(this._startedAt, finishedAt);
  }

  ngOnDestroy(): void {
    this.clearTimer();
  }
}
