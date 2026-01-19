import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { AuthGuard } from './auth-guard';
import { AuthService } from './services/auth';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let authService: AuthService;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuthGuard,
        {
          provide: AuthService,
          useValue: {
            isLoggedIn: of(false) // Valeur par défaut
          }
        },
        {
          provide: Router,
          useValue: {
            createUrlTree: jasmine.createSpy('createUrlTree')
          }
        }
      ]
    });

    guard = TestBed.inject(AuthGuard);
    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
  });

  it('should allow access when user is logged in', (done) => {
    // Override la valeur de isLoggedIn
    (authService as any).isLoggedIn = of(true);

    guard.canActivate().subscribe(result => {
      expect(result).toBe(true);
      done();
    });
  });

  it('should redirect to login when user is not logged in', (done) => {
    (authService as any).isLoggedIn = of(false);
    const urlTree = {} as any;
    (router.createUrlTree as jasmine.Spy).and.returnValue(urlTree);

    guard.canActivate().subscribe(result => {
      expect(result).toBe(urlTree);
      expect(router.createUrlTree).toHaveBeenCalledWith(['/login']);
      done();
    });
  });
});