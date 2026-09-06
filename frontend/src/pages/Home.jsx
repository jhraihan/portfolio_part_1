import { useCallback } from 'react'

import { Hero } from '@/sections/Hero'
import { FeaturedProjects } from '@/sections/FeaturedProjects'
import { Approach } from '@/sections/Approach'
import { Skills } from '@/sections/Skills'
import { AboutPreview } from '@/sections/AboutPreview'
import { ContactCTA } from '@/sections/ContactCTA'
import { useApi } from '@/hooks/useApi'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { api } from '@/services/api'

export function Home({ profile }) {
  useDocumentTitle(
    null,
    profile?.meta_description ||
      'Software engineer building full-stack web applications.',
  )

  const projectsFetcher = useCallback(
    () => api.getProjects({ featured: true }),
    [],
  )

  const {
    data: projects,
    loading: projectsLoading,
    error: projectsError,
    refetch: refetchProjects,
  } = useApi(projectsFetcher, [])

  const { data: skills, loading: skillsLoading } = useApi(
    useCallback(() => api.getSkills(), []),
    [],
  )

  const { data: coursework } = useApi(
    useCallback(() => api.getCoursework(), []),
    [],
  )

  const { data: education } = useApi(
    useCallback(() => api.getEducation(), []),
    [],
  )

  return (
    <>
      <Hero profile={profile} />

      <FeaturedProjects
        projects={projects}
        loading={projectsLoading}
        error={projectsError}
        onRetry={refetchProjects}
      />

      <Approach />

      <Skills
        categories={skills}
        coursework={coursework}
        loading={skillsLoading}
      />

      <AboutPreview profile={profile} education={education} />

      <ContactCTA profile={profile} />
    </>
  )
}
