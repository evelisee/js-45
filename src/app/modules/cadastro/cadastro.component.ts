import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { HttpClient, HttpResponseBase, HttpErrorResponse } from '@angular/common/http';
import { map, catchError } from 'rxjs/operators';
import { UserDTO } from 'src/app/models/UserDto';
import { Router } from '@angular/router';
import { PageService } from 'src/app/services/page.service';

type Mensagem = {
  [key: string]: string;
}

@Component({
  selector: 'app-cadastro',
  templateUrl: './cadastro.component.html',
  styleUrls: ['./cadastro.component.css']
})
export class CadastroComponent implements OnInit {

  mensagensErro: Mensagem[] = [];

  telefoneValidator = Validators.compose([
    Validators.required,
    Validators.minLength(8),
    Validators.pattern('[0-9]?[0-9]{4}-?[0-9]{4}')
  ])

  formCadastro = new FormGroup({
    nome: new FormControl('', Validators.required),
    username: new FormControl('', Validators.required),
    senha: new FormControl('', Validators.required),
    telefone: new FormControl('', this.telefoneValidator),
    avatar: new FormControl('', [Validators.required], this.validaImagem.bind(this))
  });

    constructor(
      private httpClient: HttpClient,
      private router: Router,
      private pageService: PageService
    ) {}
    
    ngOnInit(): void {
      this.pageService.enviaTitulo('Cadastro');
    }

    validaImagem(campoDoFormulario: FormControl) {
      return this.httpClient
        .head(campoDoFormulario.value, {
          observe: 'response'
        })
        .pipe(
          map((response: HttpResponseBase) => {
            return response.ok ? null : [{ urlInvalida: true }]
          }),
          catchError(() => {
            return [{ urlInvalida: true}];
          }),
        )
    }

    cadastrar() {

    if(this.formCadastro.valid){
      const userData = new UserDTO(this.formCadastro.value);
      this.httpClient.post('http://localhost:3200/users', userData)
      .subscribe(
        () => {
          this.formCadastro.reset();
          this.router.navigate(['']);
        }
        , (responseError: HttpErrorResponse) => {
          this.mensagensErro = responseError.error.body
        }
      )
    } else {
      this.formCadastro.markAllAsTouched()
    }
  }



}
