import { NgClass } from '@angular/common'
import { Component, inject, OnInit } from '@angular/core'
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap'
import { TranslatePipe, TranslateService } from '@ngx-translate/core'
import { ToastrService } from 'ngx-toastr'
import { firstValueFrom } from 'rxjs'

import { ApiService } from '@/app/core/api.service'

@Component({
  templateUrl: './remove-bridge-accessories.component.html',
  standalone: true,
  imports: [
    NgClass,
    TranslatePipe,
  ],
})
export class RemoveBridgeAccessoriesComponent implements OnInit {
  $activeModal = inject(NgbActiveModal)
  private $api = inject(ApiService)
  private $toastr = inject(ToastrService)
  private $translate = inject(TranslateService)

  public pairings: any[] = []
  public toDelete: string[] = []

  constructor() {}

  ngOnInit(): void {
    this.loadPairings()
  }

  async loadPairings() {
    try {
      this.pairings = (await firstValueFrom(this.$api.get('/server/pairings')))
        .filter((pairing: any) => pairing._category === 'bridge' && !pairing._main)
        .sort((_a, b) => b._main ? 1 : -1)
    } catch (error) {
      console.error(error)
      this.$toastr.error(this.$translate.instant('settings.unpair_bridge.load_error'), this.$translate.instant('toast.title_error'))
      this.$activeModal.close()
    }
  }

  toggleList(id: string) {
    if (this.toDelete.includes(id)) {
      this.toDelete = this.toDelete.filter((item: string) => item !== id)
    } else {
      this.toDelete.push(id)
    }
  }

  cleanBridges() {
    this.$activeModal.close()
    this.$toastr.info(this.$translate.instant('reset.accessory_ind.wait'))

    this.$api.delete('/server/pairings/accessories', {
      body: this.toDelete.map((id: string) => ({
        id,
      })),
    }).subscribe({
      next: () => {
        this.$toastr.info(this.$translate.instant('reset.accessory_ind.done'), this.$translate.instant('toast.title_success'))
      },
      error: (error) => {
        console.error(error)
        this.$toastr.error(this.$translate.instant('reset.accessory_ind.fail'), this.$translate.instant('toast.title_error'))
      },
    })
  }
}
