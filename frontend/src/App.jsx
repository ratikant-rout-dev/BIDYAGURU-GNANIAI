import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { AuthScreen } from './screens/AuthScreen';
import { HomeScreen } from './screens/HomeScreen';
import { TalkScreen } from './screens/TalkScreen';
import { CareerProfileScreen } from './screens/CareerProfileScreen';
import { RoadmapScreen } from './screens/RoadmapScreen';
import { CommunicationScreen } from './screens/CommunicationScreen';
import { JobMatchScreen } from './screens/JobMatchScreen';

const MainLayout = () => {
  const { user, loading } = useAuth();
  const [currentScreen, setCurrentScreen] = useState('home');

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-slate-900 flex flex-col items-center justify-center text-white space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-indigo-600 flex items-center justify-center text-3xl shadow-xl shadow-indigo-500/20 animate-bounce">
          🎓
        </div>
        <div className="text-center">
          <h1 className="text-xl font-bold tracking-tight">Bidya Guru</h1>
          <p className="text-xs text-indigo-300">Speak. Learn. Grow.</p>
        </div>
        <div className="w-6 h-6 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <AuthScreen />;
  }

  const screenTitles = {
    home: {
      title: 'Home Overview',
      subtitle: 'Monitor your career learning journey and communication practice',
    },
    talk: {
      title: 'Talk with Bidya Guru',
      subtitle: 'Multilingual Voice-to-Voice AI Career Mentor',
    },
    profile: {
      title: 'Career Profile & Skills Matrix',
      subtitle: 'Manage your target role, verified skills, and skill gap analysis',
    },
    roadmap: {
      title: 'Personalized Career Roadmap',
      subtitle: 'Structured step-by-step milestones toward your dream tech career',
    },
    communication: {
      title: 'Communication Practice',
      subtitle: 'Interactive 1-on-1 voice interview coach with live feedback',
    },
    jobs: {
      title: 'Job Match & Apply',
      subtitle: 'Real-time job opportunities matched with your roadmap & verified skills',
    },
  };

  const currentInfo = screenTitles[currentScreen] || screenTitles.home;

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar Navigation */}
      <Sidebar
        currentScreen={currentScreen}
        onNavigate={(screenId) => setCurrentScreen(screenId)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title={currentInfo.title}
          subtitle={currentInfo.subtitle}
        />

        <main className="flex-1 overflow-y-auto">
          {currentScreen === 'home' && (
            <HomeScreen onNavigate={(screenId) => setCurrentScreen(screenId)} />
          )}
          {currentScreen === 'talk' && (
            <TalkScreen onNavigate={(screenId) => setCurrentScreen(screenId)} />
          )}
          {currentScreen === 'profile' && (
            <CareerProfileScreen onNavigate={(screenId) => setCurrentScreen(screenId)} />
          )}
          {currentScreen === 'roadmap' && (
            <RoadmapScreen onNavigate={(screenId) => setCurrentScreen(screenId)} />
          )}
          {currentScreen === 'communication' && (
            <CommunicationScreen onNavigate={(screenId) => setCurrentScreen(screenId)} />
          )}
          {currentScreen === 'jobs' && (
            <JobMatchScreen onNavigate={(screenId) => setCurrentScreen(screenId)} />
          )}
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainLayout />
    </AuthProvider>
  );
}
