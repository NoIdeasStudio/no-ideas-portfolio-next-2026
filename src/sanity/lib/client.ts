import { createClient } from 'next-sanity'

import { apiVersion, dataset, projectId } from '../env'
import { getStudioUrl } from '../env.preview'

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true,
  stega: {
    studioUrl: getStudioUrl(),
    enabled: false,
  },
})
