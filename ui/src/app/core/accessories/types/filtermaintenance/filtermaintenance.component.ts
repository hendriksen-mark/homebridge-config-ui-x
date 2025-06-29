import { NgClass } from '@angular/common'
import { Component, Input } from '@angular/core'
import { InlineSVGModule } from 'ng-inline-svg-2'

import { ServiceTypeX } from '@/app/core/accessories/accessories.interfaces'

@Component({
  selector: 'app-filtermaintenance',
  templateUrl: './filtermaintenance.component.html',
  standalone: true,
  imports: [
    InlineSVGModule,
    NgClass,
  ],
})
export class FilterMaintenanceComponent {
  @Input() public service: ServiceTypeX

  constructor() {}
}
