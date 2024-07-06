import { Injectable } from '@angular/core';
import {
  SyncProvider,
  SyncProviderServiceInterface,
  SyncTarget,
} from '../sync-provider.model';
import { Observable, of } from 'rxjs';
import { IS_ANDROID_WEB_VIEW } from '../../../util/is-android-web-view';
import { SyncGetRevResult } from '../sync.model';
import { concatMap, first, map } from 'rxjs/operators';
import { GlobalConfigService } from '../../../features/config/global-config.service';
import { androidInterface } from '../../../features/android/android-interface';

@Injectable({
  providedIn: 'root',
})
export class LocalFileSyncAndroidService implements SyncProviderServiceInterface {
  id: SyncProvider = SyncProvider.LocalFile;
  isUploadForcePossible?: boolean;
  isReady$: Observable<boolean> = of(IS_ANDROID_WEB_VIEW).pipe(
    concatMap(() => this._folderPath$),
    map((v) => !!v),
  );

  private _folderPath$: Observable<string | null> = this._globalConfigService.sync$.pipe(
    map((sync) => sync.localFileSync.syncFolderPath),
  );
  private _folderPathOnce$: Observable<string | null> = this._folderPath$.pipe(first());

  // TODO implement syncTarget handling

  constructor(private _globalConfigService: GlobalConfigService) {}

  async getFileRevAndLastClientUpdate(
    syncTarget: SyncTarget,
    localRev: string | null,
  ): Promise<{ rev: string; clientUpdate?: number } | SyncGetRevResult> {
    try {
      const filePath = await this._getFilePath(syncTarget);
      const rev = androidInterface.getFileRev(filePath);

      return { rev } as any;
    } catch (e) {
      throw new Error(e as any);
    }
  }

  async uploadFileData(
    syncTarget: SyncTarget,
    dataStr: string,
    clientModified: number,
    localRev: string | null,
    isForceOverwrite?: boolean,
  ): Promise<string | Error> {
    try {
      const filePath = await this._getFilePath(syncTarget);
      androidInterface.writeFile(filePath, dataStr);
      return androidInterface.getFileRev(filePath);
    } catch (e) {
      throw new Error(e as any);
    }
  }

  async downloadFileData(
    syncTarget: SyncTarget,
    localRev: string | null,
  ): Promise<{ rev: string; dataStr: string | undefined }> {
    try {
      const filePath = await this._getFilePath(syncTarget);
      const rev = androidInterface.getFileRev(filePath);
      const dataStr = androidInterface.readFile(filePath);

      return {
        rev,
        dataStr,
      };
    } catch (e) {
      throw new Error(e as any);
    }
  }

  private async _getFilePath(syncTarget: SyncTarget): Promise<string> {
    const folderPath = await this._folderPathOnce$.toPromise();
    if (!folderPath) {
      throw new Error('No folder path given');
    }
    return `${folderPath}/${syncTarget}.json`;
  }
}
