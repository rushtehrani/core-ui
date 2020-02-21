/**
 * metric.proto
 * No description provided (generated by Openapi Generator https://github.com/openapitools/openapi-generator)
 *
 * The version of the OpenAPI document: version not set
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */
import { ApiWorkflowTemplate } from './apiWorkflowTemplate';
import { ApiWorkflowParameter } from './apiWorkflowParameter';


export interface ApiWorkflow { 
    createdAt?: string;
    uid?: string;
    name?: string;
    phase?: string;
    startedAt?: string;
    finishedAt?: string;
    manifest?: string;
    parameters?: Array<ApiWorkflowParameter>;
    workflowTemplate?: ApiWorkflowTemplate;
}

