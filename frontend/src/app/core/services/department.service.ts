import { Injectable, signal, inject } from '@angular/core';
import { Router } from '@angular/router';

export type Department = 'Mujer' | 'Hombre';

@Injectable({
  providedIn: 'root',
})
export class DepartmentService {
  private router = inject(Router);

  private storedDept = (typeof localStorage !== 'undefined' ? localStorage.getItem('mouti_department') : null) as Department | null;
  activeDepartment = signal<Department>(this.storedDept === 'Hombre' ? 'Hombre' : 'Mujer');

  setDepartment(dept: Department, navigate = true) {
    this.activeDepartment.set(dept);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('mouti_department', dept);
    }
    if (navigate) {
      this.router.navigate(['/catalog'], {
        queryParams: { gender: dept },
      });
    }
  }
}
