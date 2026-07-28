import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { CfpSubmissionComponent } from './cfp-submission.component';

describe('CfpSubmissionComponent', () => {
  let component: CfpSubmissionComponent;
  let fixture: ComponentFixture<CfpSubmissionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CfpSubmissionComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CfpSubmissionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have initial signals set correctly', () => {
    expect(component.name()).toBe('');
    expect(component.email()).toBe('');
    expect(component.talkTitle()).toBe('');
    expect(component.isGDE()).toBe(false);
    expect(component.submissionStatus()).toBe('idle');
  });

  it('should disable the submit button when status is loading', () => {
    component.submissionStatus.set('loading');
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const button = compiled.querySelector('button[type="submit"]') as HTMLButtonElement;
    expect(button.disabled).toBe(true);
  });
});
