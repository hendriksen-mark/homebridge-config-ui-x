import { Component, inject, Input, OnInit } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap'
import { TranslatePipe } from '@ngx-translate/core'

import { ServiceTypeX } from '@/app/core/accessories/accessories.interfaces'
import { ConvertTempPipe } from '@/app/core/pipes/convert-temp.pipe'

@Component({
  templateUrl: './accessory-info.component.html',
  standalone: true,
  imports: [
    FormsModule,
    TranslatePipe,
    ConvertTempPipe,
  ],
})
export class AccessoryInfoComponent implements OnInit {
  $activeModal = inject(NgbActiveModal)

  @Input() public service: ServiceTypeX
  @Input() private accessoryCache: any[]
  @Input() private pairingCache: any[]
  public accessoryInformation: Array<any>
  public matchedCachedAccessory: any = null

  constructor() {}

  ngOnInit() {
    this.accessoryInformation = Object.entries(this.service.accessoryInformation).map(([key, value]) => ({ key, value }))
    this.matchedCachedAccessory = this.matchToCachedAccessory()
    console.error(this.matchedCachedAccessory)
  }

  matchToCachedAccessory() {
    // Try to find a matching accessory from the cache
    // Start with the service bridge username and see if we have a pairing with this username
    const bridgeUsername = this.service.instance.username
    const pairing = this.pairingCache.find(pairing => pairing._username === bridgeUsername)

    if (pairing) {
      // Now to the accessory cache to grab a list of this bridge's cached accessories
      const cacheFile = pairing._main
        ? 'cachedAccessories'
        : `cachedAccessories_${pairing._id}`

      const pairingAccessories = this.accessoryCache.filter(accessory => accessory.$cacheFile === cacheFile)
      if (pairingAccessories.length) {
        const serviceInputName = this.service.accessoryInformation.Name
        const serviceInputSerialNumber = this.service.accessoryInformation['Serial Number']
        const matchingAccessories = pairingAccessories.filter((cachedAccessory) => {
          const accessoryInfoService = cachedAccessory.services.find(service => service.constructorName === 'AccessoryInformation')
          const charName = accessoryInfoService.characteristics.find((char: any) => char.displayName === 'Name')
          const charSerialNumber = accessoryInfoService.characteristics.find((char: any) => char.displayName === 'Serial Number')
          return charName.value === serviceInputName && charSerialNumber.value === serviceInputSerialNumber
        })
        if (matchingAccessories.length === 1) {
          return {
            ...matchingAccessories[0],
            bridge: pairing.name,
          }
        }
      }
    }
  }
}
