// src/app/core/services/credito.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';
import { lastValueFrom } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class CuotaService {
    private http = inject(HttpClient);
    private authService = inject(AuthService);
    private apiUrl = 'http://localhost:3000/api';

    getCuotas(): Promise<any> {
        const get = this.http.get(`${this.apiUrl}/cuotas`, this.authService.getAuthHeaders());
        return lastValueFrom(get);
    }
}