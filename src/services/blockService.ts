import { PoolConnection } from "mysql"
import { blockModel } from "../models/block"
import { profileService } from "./profileService"
import { buddyService } from "./buddyService"

class BlockService {
  /**
   * 내가 이 사람을 차단했는지 확인합니다.
   * @param blocks 내가 차단한 목록 getBlocksThatBlockedByMe()로 가져온 차단 목록
   * @param profileId 차단 당한 사람의 profileId
   * @returns 
   */
  hasBlockedProfile(blocks: [], profileId: number): boolean {
    return blocks.some((block: any) => block.blockProfileId === profileId)
  }

  /**
   * 
   * 넘겨 받는 profileId가 차단한 사람인지 확인합니다.
   * @param blocks 나를 차단한 목록 getBlocksThatBlockMe()로 가져온 차단 목록
   * @param profileId 차단한 사람의 profileId
   * @returns 
   */
  isBlocked(blocks: [], profileId: number): boolean {
    return blocks.some((block: any) => block.profileId === profileId)
  }

  async postBlock(profileId: number, blockProfileId: number, connection?: PoolConnection): Promise<any> {
    if (profileId === blockProfileId) {
      throw new Error('자기 자신을 차단할 수 없습니다.')
    }
    const blockProfile = await profileService.getProfileInfo(blockProfileId, connection)
    if (!blockProfile) {
      throw new Error('사용자가 존재하지 않습니다.')
    }
    const block = await blockModel.findOneBlock(profileId, blockProfileId, connection)
    if (block) {
      throw new Error('이미 차단한 사용자입니다.')
    }
    const myProfile = await profileService.getProfileInfo(profileId, connection)

    if (!this.isFamily(blockProfile, myProfile)) {
      await buddyService.deleteBuddy(profileId, blockProfileId, connection)
    }
    return await blockModel.createBlock(profileId, blockProfileId, connection)
  }

  private isFamily(blockProfile: any, myProfile: any) {
    return blockProfile.userId === myProfile.userId
  }

  /**
   * 
   * @param profileId 
   * @param blockProfileId 
   * @param connection 
   * @returns 
   */
  async getOneBlock(profileId: number, blockProfileId: number, connection?: PoolConnection): Promise<any> {
    return await blockModel.findOneBlock(profileId, blockProfileId, connection)
  }

  /**
   * 내가 차단한 사람의 목록을 페지네이션하여 가져옵니다지
   * @param profileId 
   * @param options 
   * @param connection 
   * @returns 
   */
  async getBlocksUsingPaging(profileId: number, options:{page: number, perPage: number}, connection?: PoolConnection): Promise<any> {
    return await blockModel.findAllBlocksUsingPaging(profileId, options, connection)
  }

  /**
   * 내가 차단한 사람의 목록을 가져옵니다.
   * @param myProfileId 
   * @param connection 
   * @returns 
   */
  async getBlocksThatBlockedByMe(myProfileId: number, connection?: PoolConnection): Promise<any> {
    return await blockModel.findBlocksThatBlockedByMe(myProfileId, connection)
  }

  /**
   * 나를 차단한 사람의 목록을 가져옵니다나
   * @param myProfileId 
   * @param connection 
   * @returns 
   */
  async getBlocksThatBlockMe(myProfileId: number, connection?: PoolConnection): Promise<any> {
    return await blockModel.findAllBlocksThatBlockMe(myProfileId, connection)
  }

  async deleteBlock(profileId: number, blockProfileId: number, connection?: PoolConnection): Promise<any> {
    return await blockModel.deleteBlock(profileId, blockProfileId, connection)
  }
}

export const blockService = new BlockService()