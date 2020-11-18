/**
 * Onepanel
 * Onepanel API
 *
 * The version of the OpenAPI document: 0.16.0
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */
import { KeyValue } from './keyValue';
import { Parameter } from './parameter';


export interface CreateWorkflowExecutionBody { 
    workflowTemplateUid?: string;
    workflowTemplateVersion?: string;
    parameters?: Array<Parameter>;
    labels?: Array<KeyValue>;
}

