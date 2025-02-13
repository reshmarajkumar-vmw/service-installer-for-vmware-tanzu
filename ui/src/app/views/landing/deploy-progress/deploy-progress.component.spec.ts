/*
 * Copyright 2021 VMware, Inc
 * SPDX-License-Identifier: BSD-2-Clause
 */
// Angular modules
import { TestBed, waitForAsync, ComponentFixture } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

// App imports
import { DeployProgressComponent } from './deploy-progress.component';
import { AppDataService } from 'src/app/shared/service/app-data.service';

describe('DeployProgressComponent', () => {
    let fixture: ComponentFixture<DeployProgressComponent>;
    let component: DeployProgressComponent;
    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [
                RouterTestingModule
            ],
            declarations: [
                DeployProgressComponent
            ],
            schemas: [
                CUSTOM_ELEMENTS_SCHEMA
            ],
        }).compileComponents();
    }));
    beforeEach(() => {
        fixture = TestBed.createComponent(DeployProgressComponent);
        component = fixture.componentInstance;
        component.clusterType = 'management';
        fixture.detectChanges();
    });

    it('should exist', () => {
        const landingComponent = fixture.debugElement.componentInstance;
        expect(landingComponent).toBeTruthy();
    });

    it('should init component', () => {
        const appDataService = TestBed.inject(AppDataService);
        const initWebSocketSpy = spyOn(component, 'initWebSocket').and.callThrough();
        component.ngOnInit();
        appDataService.setProviderType('vsphere');
        expect(component.providerType).toBe('vSphere');
        appDataService.setProviderType('aws');
        expect(component.providerType).toBe('AWS');
        appDataService.setProviderType('azure');
        expect(component.providerType).toBe('Azure');
        component.providerType = '';
        appDataService.setProviderType('none');
        expect(component.providerType).toBe('');
        expect(initWebSocketSpy).toHaveBeenCalled();
    });
    it('should convert log type', () => {
        expect(component.convertLogType('ERROR')).toBe('ERR');
        expect(component.convertLogType('FATAL')).toBe('ERR');
        expect(component.convertLogType('INFO')).toBe('INFO');
        expect(component.convertLogType('WARN')).toBe('WARN');
        expect(component.convertLogType('UNKNOWN')).toBe(null);
    });
    it('should process data', () => {
        const data = {
            type: 'log',
            data: {
                currentPhase: 'test',
                logType: 'INFO',
                message: ' 2016-11-09 23:17:56 test message',
                status: 'successful',
                totalPhases: null
            }
        };
        expect(component.processData(data)).toEqual({
            message: 'test message',
            type: 'INFO',
            timestamp: '2016-11-09 23:17:56'
        });

        data.type = 'notLog';
        component.processData(data);
        expect(component.curStatus.msg).toBe(' 2016-11-09 23:17:56 test message');
        expect(component.curStatus.status).toBe('successful');
        expect(component.curStatus.curPhase).toBe('test');

        data.data.status = 'pending'; // pending is not a real status
        data.data.totalPhases = 'this is test phase';
        component.processData(data);
        expect(component.curStatus.msg).toBe(' 2016-11-09 23:17:56 test message');
        expect(component.curStatus.status).toBe('pending');
        expect(component.curStatus.curPhase).toBe('test');
    });
    it('should get status description', () => {
        component.curStatus = {
            status: 'running'
        };
        component.pageTitle = 'Tanzu Kubernetes Grid';
        component.providerType = 'vSphere';
        expect(component.getStatusDescription()).toBe(
            'Deployment of the Tanzu Kubernetes Grid management cluster to vSphere is in progress.');
        component.curStatus.status = 'successful';
        expect(component.getStatusDescription()).toBe(
            'Deployment of the Tanzu Kubernetes Grid management cluster to vSphere is successful.');
        component.curStatus.status = 'failed';
        expect(component.getStatusDescription()).toBe(
            'Deployment of the Tanzu Kubernetes Grid management cluster to vSphere has failed.');
    });
});
