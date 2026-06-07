
export function getRouteForRole(role) {
    switch (role) {
      case 'COORDINATOR':
        return '/coordinator/dashboard';
      case 'PROGRAM_DIRECTOR':
        return '/director/dashboard';
      case 'PATIENT':
      default:
        return '/patient/portal';
    }
  }