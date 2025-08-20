import { Component } from '@angular/core';

@Component({
  selector: 'app-contact',
  imports: [],
  template: `
    <h2>Contactez-nous</h2>
    <p>Une question ? Écrivez-nous !</p>
    <textarea placeholder="Votre message...."></textarea>
    <button>Envoyer</button>
  `,
})
export class Contact {}
