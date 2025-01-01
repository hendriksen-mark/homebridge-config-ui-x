import { NgClass, TitleCasePipe } from '@angular/common'
import { Component, inject, OnInit } from '@angular/core'
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap'
import { TranslatePipe, TranslateService } from '@ngx-translate/core'
import { ToastrService } from 'ngx-toastr'
import { firstValueFrom } from 'rxjs'

import { ApiService } from '@/app/core/api.service'

@Component({
  templateUrl: './reset-individual-bridges.component.html',
  standalone: true,
  imports: [
    NgClass,
    TitleCasePipe,
    TranslatePipe,
  ],
})
export class ResetIndividualBridgesComponent implements OnInit {
  $activeModal = inject(NgbActiveModal)
  private $api = inject(ApiService)
  private $toastr = inject(ToastrService)
  private $translate = inject(TranslateService)

  public pairingsNonChild: any[] = []
  public pairingsChildActive: any[] = []
  public pairingsChildStale: any[] = []
  public toDelete: { id: string, resetPairingInfo: boolean }[] = []

  constructor() {}

  ngOnInit(): void {
    this.loadPairings()
  }

  async loadPairings() {
    try {
      const pairings = (await firstValueFrom(this.$api.get('/server/pairings')))
        .filter((pairing: any) => !pairing._main)
        .sort((_a, b) => b._main ? 1 : -1)

      this.pairingsChildActive = pairings.filter((pairing: any) => pairing._category === 'bridge' && !pairing._couldBeStale)
      this.pairingsNonChild = pairings.filter((pairing: any) => pairing._category !== 'bridge')
      this.pairingsChildStale = pairings.filter((pairing: any) => pairing._category === 'bridge' && pairing._couldBeStale)
    } catch (error) {
      console.error(error)
      this.$toastr.error(this.$translate.instant('settings.unpair_bridge.load_error'), this.$translate.instant('toast.title_error'))
      this.$activeModal.close()
    }
  }

  toggleList(id: string, resetPairingInfo: boolean = false) {
    if (this.toDelete.some((item: { id: string }) => item.id === id)) {
      this.toDelete = this.toDelete.filter((item: { id: string, resetPairingInfo: boolean }) => item.id !== id)
    } else {
      this.toDelete.push({ id, resetPairingInfo })
    }
  }

  isInList(id: string) {
    return this.toDelete.some((item: { id: string }) => item.id === id)
  }

  removeBridges() {
    this.$activeModal.close()
    this.$toastr.info(this.$translate.instant('reset.bridge_ind.wait'))

    this.$api.delete('/server/pairings', {
      body: this.toDelete,
    }).subscribe({
      next: () => {
        this.$toastr.info(this.$translate.instant('reset.bridge_ind.done'), this.$translate.instant('toast.title_success'))
      },
      error: (error) => {
        console.error(error)
        this.$toastr.error(this.$translate.instant('reset.bridge_ind.fail'), this.$translate.instant('toast.title_error'))
      },
    })
  }
}
