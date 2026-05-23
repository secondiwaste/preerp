import { TestBed } from '@angular/core/testing';
import { ToastService, Toast } from './toast.service';

describe('ToastService', () => {
  let service: ToastService;
  let emittedToasts: Toast[] = [];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ToastService]
    });
    service = TestBed.inject(ToastService);
    emittedToasts = [];

    // Subscribe to toasts
    service.toasts$.subscribe(toast => {
      emittedToasts.push(toast);
    });
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('show', () => {
    it('should emit toast with correct properties', () => {
      service.show('success', 'Test message', 5000);

      expect(emittedToasts.length).toBe(1);
      expect(emittedToasts[0].type).toBe('success');
      expect(emittedToasts[0].message).toBe('Test message');
      expect(emittedToasts[0].duration).toBe(5000);
      expect(emittedToasts[0].id).toBe(1);
    });

    it('should use default duration of 3000ms', () => {
      service.show('info', 'Test message');

      expect(emittedToasts.length).toBe(1);
      expect(emittedToasts[0].duration).toBe(3000);
    });

    it('should increment toast id for each toast', () => {
      service.show('success', 'First toast');
      service.show('info', 'Second toast');
      service.show('error', 'Third toast');

      expect(emittedToasts.length).toBe(3);
      expect(emittedToasts[0].id).toBe(1);
      expect(emittedToasts[1].id).toBe(2);
      expect(emittedToasts[2].id).toBe(3);
    });
  });

  describe('success', () => {
    it('should emit success toast', () => {
      service.success('Success message');

      expect(emittedToasts.length).toBe(1);
      expect(emittedToasts[0].type).toBe('success');
      expect(emittedToasts[0].message).toBe('Success message');
    });

    it('should use custom duration if provided', () => {
      service.success('Success message', 7000);

      expect(emittedToasts[0].duration).toBe(7000);
    });

    it('should use default duration if not provided', () => {
      service.success('Success message');

      expect(emittedToasts[0].duration).toBe(3000);
    });
  });

  describe('error', () => {
    it('should emit error toast', () => {
      service.error('Error message');

      expect(emittedToasts.length).toBe(1);
      expect(emittedToasts[0].type).toBe('error');
      expect(emittedToasts[0].message).toBe('Error message');
    });

    it('should use custom duration if provided', () => {
      service.error('Error message', 10000);

      expect(emittedToasts[0].duration).toBe(10000);
    });
  });

  describe('info', () => {
    it('should emit info toast', () => {
      service.info('Info message');

      expect(emittedToasts.length).toBe(1);
      expect(emittedToasts[0].type).toBe('info');
      expect(emittedToasts[0].message).toBe('Info message');
    });

    it('should use custom duration if provided', () => {
      service.info('Info message', 4000);

      expect(emittedToasts[0].duration).toBe(4000);
    });
  });

  describe('warning', () => {
    it('should emit warning toast', () => {
      service.warning('Warning message');

      expect(emittedToasts.length).toBe(1);
      expect(emittedToasts[0].type).toBe('warning');
      expect(emittedToasts[0].message).toBe('Warning message');
    });

    it('should use custom duration if provided', () => {
      service.warning('Warning message', 6000);

      expect(emittedToasts[0].duration).toBe(6000);
    });
  });

  describe('toasts$ observable', () => {
    it('should emit multiple toasts in sequence', () => {
      service.success('First');
      service.error('Second');
      service.info('Third');

      expect(emittedToasts.length).toBe(3);
      expect(emittedToasts[0].message).toBe('First');
      expect(emittedToasts[1].message).toBe('Second');
      expect(emittedToasts[2].message).toBe('Third');
    });

    it('should have unique ids for all toasts', () => {
      const toastCount = 10;
      for (let i = 0; i < toastCount; i++) {
        service.info(`Toast ${i}`);
      }

      const ids = emittedToasts.map(t => t.id);
      const uniqueIds = new Set(ids);
      
      expect(uniqueIds.size).toBe(toastCount);
      expect(ids).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    });
  });

  describe('toast types', () => {
    it('should support all toast types', () => {
      const types: Toast['type'][] = ['success', 'error', 'info', 'warning'];
      
      types.forEach(type => {
        service.show(type, `${type} message`);
      });

      expect(emittedToasts.length).toBe(4);
      expect(emittedToasts[0].type).toBe('success');
      expect(emittedToasts[1].type).toBe('error');
      expect(emittedToasts[2].type).toBe('info');
      expect(emittedToasts[3].type).toBe('warning');
    });
  });
});
