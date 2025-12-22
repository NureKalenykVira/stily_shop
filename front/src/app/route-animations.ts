import {
  trigger,
  transition,
  style,
  query,
  animate,
  group
} from '@angular/animations';

export const fader = trigger('fader', [
  transition('* <=> *', [
    query(':enter, :leave', [
      style({
        position: 'absolute',
        width: '100%',
        opacity: 0,
      })
    ], { optional: true }),
    group([
      query(':leave', [
        animate('300ms ease', style({ opacity: 0 }))
      ], { optional: true }),
      query(':enter', [
        animate('300ms ease', style({ opacity: 1 }))
      ], { optional: true })
    ])
  ])
]);
