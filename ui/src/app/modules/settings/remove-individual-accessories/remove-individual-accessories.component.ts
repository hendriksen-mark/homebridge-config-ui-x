import { NgClass } from '@angular/common'
import { Component, inject, OnInit } from '@angular/core'
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap'
import { TranslatePipe, TranslateService } from '@ngx-translate/core'
import { ToastrService } from 'ngx-toastr'
import { firstValueFrom } from 'rxjs'

import { ApiService } from '@/app/core/api.service'

@Component({
  templateUrl: './remove-individual-accessories.component.html',
  standalone: true,
  imports: [
    NgClass,
    TranslatePipe,
  ],
})
export class RemoveIndividualAccessoriesComponent implements OnInit {
  $activeModal = inject(NgbActiveModal)
  private $api = inject(ApiService)
  private $toastr = inject(ToastrService)
  private $translate = inject(TranslateService)

  public cachedAccessories: any[] = []
  public toDelete: { cacheFile: string, uuid: string }[] = []
  public mainBridgeName: string = ''

  constructor() {}

  ngOnInit(): void {
    this.mainBridgeName = this.$translate.instant('reset.accessory_ind.main')
    this.loadCachedAccessories()
  }

  async loadCachedAccessories() {
    try {
      this.cachedAccessories = (await firstValueFrom(this.$api.get('/server/cached-accessories')))
        .map((accessory: any) => ({
          ...accessory,
          $cacheFileDisplay: accessory.$cacheFile?.startsWith('cachedAccessories.')
            ? accessory.$cacheFile
                .replace('cachedAccessories.', '')
                .match(/.{1,2}/g)
                .join(':')
            : this.mainBridgeName,
        }))
    } catch (error) {
      console.error(error)
      this.$toastr.error(this.$translate.instant('reset.error_message'), this.$translate.instant('toast.title_error'))
      this.$activeModal.close()
    }
  }

  toggleList(uuid: string, cacheFile: string) {
    if (this.toDelete.some((item: { cacheFile: string, uuid: string }) => item.uuid === uuid && item.cacheFile === cacheFile)) {
      this.toDelete = this.toDelete.filter((item: { cacheFile: string, uuid: string }) => item.uuid !== uuid && item.cacheFile !== cacheFile)
    } else {
      this.toDelete.push({ cacheFile, uuid })
    }
  }

  isInList(id: string, cacheFile: string) {
    return this.toDelete.some((item: { cacheFile: string, uuid: string }) => item.uuid === id && item.cacheFile === cacheFile)
  }

  removeAccessories() {
    this.$activeModal.close()
    this.$toastr.info(this.$translate.instant('reset.accessory_ind.wait'))

    this.$api.delete('/server/cached-accessories', {
      body: this.toDelete,
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
