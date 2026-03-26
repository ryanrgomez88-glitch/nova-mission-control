'use client'
import { motion } from 'framer-motion'
import AgentBanner from '@/components/AgentBanner'
import PortfolioPulse from '@/components/PortfolioPulse'
import N45BPStats from '@/components/N45BPStats'
import OvernightReports from '@/components/OvernightReports'
import RDMemo from '@/components/RDMemo'
import OpenBlockers from '@/components/OpenBlockers'
import IdeasPipeline from '@/components/IdeasPipeline'
import DailyLog from '@/components/DailyLog'
import GoalsTracker from '@/components/GoalsTracker'

export default function Home() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      <AgentBanner />
      <PortfolioPulse />
      <N45BPStats />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <OvernightReports />
        <RDMemo />
        <OpenBlockers />
      </div>
      <div className="mb-6">
        <IdeasPipeline />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <DailyLog />
        <GoalsTracker />
      </div>
    </motion.div>
  )
}
