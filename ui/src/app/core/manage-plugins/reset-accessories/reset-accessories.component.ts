import { NgClass } from '@angular/common'
import { Component, inject, Input, OnInit } from '@angular/core'
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap'
import { TranslatePipe, TranslateService } from '@ngx-translate/core'
import { ToastrService } from 'ngx-toastr'
import { firstValueFrom } from 'rxjs'

import { ApiService } from '@/app/core/api.service'

interface ChildBridge {
  identifier: string
  manuallyStopped: boolean
  name: string
  paired: boolean
  pid: number
  pin: string
  plugin: string
  setupUri: string
  status: string
  username: string
}

@Component({
  templateUrl: './reset-accessories.component.html',
  standalone: true,
  imports: [
    NgClass,
    TranslatePipe,
  ],
})
export class ResetAccessoriesComponent implements OnInit {
  $activeModal = inject(NgbActiveModal)
  private $api = inject(ApiService)
  private $modal = inject(NgbModal)
  private $toastr = inject(ToastrService)
  private $translate = inject(TranslateService)

  @Input() childBridges: ChildBridge[] = []
  public pairings: any[] = []
  public toDelete: string[] = []

  constructor() {}

  ngOnInit(): void {
    this.loadPairings()
  }

  async loadPairings() {
    try {
      this.pairings = (await firstValueFrom(this.$api.get('/server/pairings')))
        .filter((pairing: any) => {
          return pairing._category === 'bridge' && !pairing._main && this.childBridges.find(childBridge => childBridge.username === pairing._username)
        })
        .sort((a, b) => a.name.localeCompare(b.name))
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
