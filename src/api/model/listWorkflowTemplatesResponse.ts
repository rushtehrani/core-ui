/**
 * Onepanel
 * Onepanel API
 *
 * The version of the OpenAPI document: 0.14.0
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */
import { WorkflowTemplate } from './workflowTemplate';


export interface ListWorkflowTemplatesResponse { 
    count?: number;
    workflowTemplates?: Array<WorkflowTemplate>;
    page?: number;
    pages?: number;
    totalCount?: number;
}

