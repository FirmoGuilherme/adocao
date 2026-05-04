import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface Guide {
  id: number;
  category: string;
  categoryColor: string;
  title: string;
  summary: string;
  readTime: string;
  imageUrl: string;
  mustRead?: boolean;
  content: string;
}

@Component({
  selector: 'app-education',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="bg-background min-h-screen py-10">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div class="text-center mb-16">
          <h1 class="text-4xl font-extrabold text-gray-900">Academia de Adoção Responsável</h1>
          <p class="mt-4 text-xl text-gray-500 max-w-2xl mx-auto">Tudo o que você precisa saber antes, durante e depois de acolher um pet resgatado no seu lar.</p>
        </div>

        <div *ngIf="selectedGuide" class="max-w-3xl mx-auto">
          <button (click)="closeGuide()" class="text-sm text-gray-500 hover:text-gray-700 mb-6 flex items-center">
            ← Voltar para todos os guias
          </button>
          <article class="bg-white rounded-3xl shadow-soft overflow-hidden">
            <img [src]="selectedGuide.imageUrl" [alt]="selectedGuide.title" class="w-full h-64 object-cover">
            <div class="p-8 md:p-12">
              <span class="text-xs font-bold uppercase tracking-wider mb-3 inline-block"
                [ngClass]="{'text-primary': selectedGuide.categoryColor === 'primary', 'text-secondary': selectedGuide.categoryColor === 'secondary', 'text-blue-500': selectedGuide.categoryColor === 'blue'}">
                {{ selectedGuide.category }}
              </span>
              <h1 class="text-3xl font-extrabold text-gray-900 mb-4">{{ selectedGuide.title }}</h1>
              <p class="text-sm text-gray-400 mb-8">{{ selectedGuide.readTime }} de leitura</p>
              <div class="prose prose-lg text-gray-700 leading-relaxed whitespace-pre-line">{{ selectedGuide.content }}</div>
            </div>
          </article>
        </div>

        <div *ngIf="!selectedGuide">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div *ngFor="let guide of guides"
              (click)="openGuide(guide)"
              class="card overflow-hidden hover:shadow-float cursor-pointer transition flex flex-col h-full bg-white"
              [ngClass]="{'border-2 border-primary border-opacity-50 relative': guide.mustRead}">
              <div *ngIf="guide.mustRead" class="absolute top-0 right-0 bg-primary text-white text-xs font-bold px-3 py-1 rounded-bl-lg">Leitura Obrigatória</div>
              <img *ngIf="guide.imageUrl.startsWith('http')" [src]="guide.imageUrl" [alt]="guide.title" class="h-48 w-full object-cover">
              <div *ngIf="!guide.imageUrl.startsWith('http')" class="bg-green-50 h-48 w-full flex items-center justify-center text-6xl">🐕🐈</div>
              <div class="p-6 flex flex-col flex-grow">
                <span class="text-xs font-bold uppercase tracking-wider mb-2"
                  [ngClass]="{'text-primary': guide.categoryColor === 'primary', 'text-secondary': guide.categoryColor === 'secondary', 'text-blue-500': guide.categoryColor === 'blue'}">
                  {{ guide.category }}
                </span>
                <h3 class="text-xl font-bold text-gray-900 mb-2">{{ guide.title }}</h3>
                <p class="text-gray-600 text-sm mb-4 line-clamp-3 flex-grow">{{ guide.summary }}</p>
                <div class="flex items-center justify-between text-sm text-gray-500 mt-auto pt-4 border-t border-gray-100">
                  <span>{{ guide.readTime }}</span>
                  <span class="text-primary font-medium hover:underline">Ler Guia →</span>
                </div>
              </div>
            </div>
          </div>

          <div class="mt-16 bg-blue-50 rounded-3xl p-8 md:p-12 text-center border border-blue-100">
            <h2 class="text-2xl font-bold text-gray-900 mb-4">Vai fazer o Quiz de Compatibilidade?</h2>
            <p class="text-gray-600 mb-6 max-w-xl mx-auto">Leia nosso caminho de aprendizado "Antes de Adotar" para melhorar sua pontuação e mostrar aos abrigos que você está preparado.</p>
            <a routerLink="/quiz" class="btn-primary inline-block">Começar Caminho de Aprendizado</a>
          </div>
        </div>
      </div>
    </div>
  `
})
export class EducationComponent {
  selectedGuide: Guide | null = null;

  guides: Guide[] = [
    {
      id: 1, category: 'Primeiros Dias', categoryColor: 'primary',
      title: 'Como preparar sua casa para um cão resgatado',
      summary: 'Trazer um novo cão para casa é emocionante, mas requer preparação. Aprenda a adaptar seu ambiente para reduzir o estresse inicial e garantir a segurança.',
      readTime: '5 min',
      imageUrl: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=600&q=80',
      content: `Trazer um cão resgatado para casa é uma das experiências mais gratificantes, mas requer preparação cuidadosa.

Designe um espaço tranquilo onde seu novo cão possa se acalmar. Deve ser uma área com pouco movimento, com uma cama confortável, tigela de água e alguns brinquedos. Evite sobrecarregá-lo com a casa inteira no primeiro dia.

Remova perigos ao nível do cão: fios elétricos, plantas tóxicas (lírios, filodendros), objetos pequenos que possam ser engolidos e produtos de limpeza. Proteja as lixeiras com tampas.

Tenha os itens essenciais antes da chegada: ração (pergunte ao abrigo o que ele estava comendo para evitar mudanças bruscas de dieta), coleira com identificação, guia, tigelas de comida e água, cama ou caixa de transporte, limpador enzimático para acidentes e itens básicos de higiene.

Estabeleça uma rotina desde o primeiro dia. Cães prosperam com previsibilidade. Alimente nos mesmos horários, passeie pela mesma rota inicialmente e mantenha o horário de dormir consistente.

A "regra dos 3-3-3" é um guia útil: 3 dias para se acalmar, 3 semanas para aprender sua rotina, 3 meses para se sentir verdadeiramente em casa. Não apresse o vínculo — deixe-o vir até você.`
    },
    {
      id: 2, category: 'Vida em Apartamento', categoryColor: 'secondary',
      title: 'O que saber antes de adotar um gato',
      summary: 'Gatos são excelentes companheiros de apartamento, mas precisam de espaço vertical, arranhadores adequados e redes de proteção nas janelas.',
      readTime: '4 min',
      imageUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=600&q=80',
      content: `Gatos se adaptam maravilhosamente à vida em apartamento, mas o ambiente precisa atender necessidades específicas.

Instale redes de proteção em todas as janelas e sacadas. Gatos são curiosos e podem cair de alturas — este é o acidente evitável número um para gatos de apartamento. Faça isso antes de trazer seu gato para casa.

Forneça espaço vertical. Árvores para gatos, prateleiras na parede ou camas de janela dão aos gatos os pontos elevados que eles instintivamente buscam. Um gato com território vertical é um gato mais feliz e menos estressado.

Coloque arranhadores perto dos móveis que você quer proteger. Gatos arranham para marcar território e manter as unhas — não é comportamento destrutivo, é natural. Arranhadores de sisal geralmente são preferidos.

Posicione a caixa de areia em um local tranquilo e acessível, longe da comida e água. A regra geral é uma caixa por gato mais uma extra. Limpe diariamente e troque completamente semanalmente.

Crie esconderijos. Caixas de papelão, camas cobertas ou espaços atrás de móveis dão aos gatos uma sensação de segurança. Isso é especialmente importante nas primeiras semanas.`
    },
    {
      id: 3, category: 'Saúde e Bem-estar', categoryColor: 'blue',
      title: 'Por que a castração é importante',
      summary: 'A castração não é apenas controle populacional; ela melhora significativamente a saúde do seu pet, previne certos cânceres e reduz problemas comportamentais.',
      readTime: '8 min',
      imageUrl: 'https://images.unsplash.com/photo-1450778869180-41d0601e046e?auto=format&fit=crop&w=600&q=80',
      mustRead: true,
      content: `A castração é uma das decisões de saúde mais importantes que você pode tomar pelo seu pet.

Para fêmeas, a castração antes do primeiro cio reduz o risco de tumores mamários em mais de 90%. Também elimina o risco de piometra, uma infecção uterina potencialmente fatal que afeta cerca de 25% das fêmeas não castradas.

Para machos, a castração reduz o risco de problemas de próstata e elimina o câncer testicular. Também reduz significativamente o comportamento de fuga — machos não castrados percorrem longas distâncias para encontrar uma parceira, aumentando o risco de acidentes de trânsito e brigas.

Os benefícios comportamentais são substanciais. Machos castrados são menos propensos a marcar território com urina, mostram menos agressividade e são geralmente mais calmos.

O procedimento é rotineiro e seguro. A maioria dos pets vai para casa no mesmo dia e se recupera totalmente em 7-10 dias. O manejo moderno da dor significa desconforto mínimo.

O impacto populacional é impressionante. Uma única fêmea não castrada pode ser responsável por 370.000 descendentes em apenas 7 anos. Cada ninhada não planejada contribui para a superlotação de abrigos.

A maioria dos abrigos inclui a castração na taxa de adoção. Se seu pet ainda não foi castrado, converse com seu veterinário sobre o melhor momento — para a maioria dos pets, é seguro a partir de 4-6 meses de idade.`
    },
    {
      id: 4, category: 'Adaptação', categoryColor: 'primary',
      title: 'Como apresentar um novo pet a outro animal',
      summary: 'Um guia passo a passo para apresentações seguras e graduais, prevenindo brigas e construindo laços duradouros.',
      readTime: '6 min', imageUrl: 'emoji',
      content: `Apresentar um novo pet a um animal residente requer paciência e uma abordagem estruturada. Apressar esse processo é o erro mais comum.

Comece com a troca de cheiros. Antes de qualquer contato visual, troque camas ou toalhas entre os animais para que se acostumem com o cheiro um do outro. Faça isso por 2-3 dias.

Use espaços separados inicialmente. O novo pet deve ter seu próprio cômodo com comida, água, caixa de areia (para gatos) e cama. Isso dá a ambos os animais tempo para se ajustar sem o estresse da interação direta.

Comece com apresentações com barreira. Deixe-os se ver através de um portão de bebê ou porta entreaberta. Observe a linguagem corporal: postura relaxada, curiosidade e convites para brincar são bons sinais. Corpos rígidos, rosnados, silvos ou pelos eriçados significam que precisam de mais tempo.

Para apresentações cão-cão, encontre-se em território neutro primeiro (um parque ou quintal de vizinho). Caminhe com eles em paralelo a uma distância, diminuindo gradualmente o espaço ao longo de várias sessões.

Para apresentações gato-gato, o processo é mais lento. Após a troca de cheiros e apresentações com barreira, permita encontros curtos supervisionados. Tenha petiscos prontos para criar associações positivas.

Nunca deixe animais novos sem supervisão juntos até ter certeza de que estão confortáveis — isso geralmente leva no mínimo 2-4 semanas.`
    }
  ];

  openGuide(guide: Guide) {
    this.selectedGuide = guide;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  closeGuide() { this.selectedGuide = null; }
}
