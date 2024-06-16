import fs from 'fs-extra'
import path from 'path'
import simpleGit, { TaskOptions } from 'simple-git'

/**
 * Verifica se o repositório remoto existe.
 * @param repoUrl - URL do repositório remoto.
 * @returns - true se o repositório remoto existir, false caso contrário.
 */
async function remoteRepoExists(repoUrl: TaskOptions): Promise<boolean> {
  const git = simpleGit()
  try {
    await git.listRemote(repoUrl)
    return true
    // eslint-disable
  } catch (error: any) {
    console.error(`Remote repository ${repoUrl} does not exist:`, error.message)
    return false
  }
}

export async function gitPushAll(path: string) {
  const foldersWithNoGit: string[] = []
  try {
    const folders = await fs.readdir(path)

    for (const folder of folders) {
      if (folders.indexOf(folder) !== 0)
        console.info('Moving to the next folder')

      if (path.at(-1) !== '/') {
        path = path + '/'
      }

      const currentFolder = `${path}${folder}`
      console.info('Accessing folder ', folder)

      const pathToSearch = currentFolder + '/.git'
      console.info('Checking if ', pathToSearch, ' exists.')
      if (await fs.pathExists(pathToSearch)) {
        console.info('Git detected')
        const git = simpleGit(currentFolder)

        const status = await git.status()

        if (!status.isClean()) {
          console.info('Changes detected. Adding files to be pushed...')
          await git.add('.')

          console.info('Commiting...')
          await git.commit('Auto_commit made by auto-updates-all-gits')

          console.info('Pushing...')
          await git.push()
        } else {
          console.info('No changes detected')
        }
      } else {
        foldersWithNoGit.push(currentFolder)
      }
    }
  } catch (er) {
    console.error(er)
  }

  const finalReport = `
  Folders with no Git

  ${foldersWithNoGit.map((folder) => folder).join('\n')}
  `

  console.info(finalReport)
}
