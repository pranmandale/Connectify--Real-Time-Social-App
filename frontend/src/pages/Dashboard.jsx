import React from 'react'
import LeftPart from '../components/dashboard_components/LeftPart'
import Feed from '../components/dashboard_components/Feed'
import RightPart from '../components/dashboard_components/RightPart'
import { useSelector } from 'react-redux'

const Dashboard = () => {
  const {profile} = useSelector(state => state.user);
  // console.log(profile);
  
  return (
    <div className="w-full flex justify-center items-start bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 min-h-screen">
      <LeftPart />
      <Feed />
      <RightPart />
    </div>
  )
}

export default Dashboard