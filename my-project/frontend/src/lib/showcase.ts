import { api, type Job } from '@/api'

export interface ShowcaseClip { title: string; video: string; href: string }

export async function loadShowcase(jobs: Job[]): Promise<ShowcaseClip[]> {
  const done = jobs.filter((j) => j.status === 'done')
  const lists = await Promise.all(done.map((j) => api.listClips(j.id)))
  return lists.flat().flatMap((clip) =>
    clip.exports.length
      ? [{ title: clip.title, video: clip.exports[0].download_url, href: `/jobs/${clip.job_id}/clips` }]
      : [],
  ).slice(0, 15)
}
