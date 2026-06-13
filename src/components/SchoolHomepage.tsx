import { useState, useEffect } from 'react';
import { 
  ArrowRight, 
  ChevronLeft, 
  ChevronRight, 
  Play, 
  Pause,
  Award, 
  Microscope, 
  BookOpen, 
  Building,
  GraduationCap, 
  CheckCircle,
  FileCheck2,
  Lock,
  Compass,
  Laptop
} from 'lucide-react';
import { Announcement } from '../types';
import campusImg from "../assets/images/1.png";
import libraryImg from "../assets/images/2.png";
import dnaLabImg from "../assets/images/3.png";
import digitalLearnImg from "../assets/images/4.png";
import chemistryLabImg from "../assets/images/5.png";

// Slide references using premium education image URLs


interface SchoolHomepageProps {
  onNavigate: (tab: 'home' | 'student' | 'teacher') => void;
  announcements: Announcement[];
}

export default function SchoolHomepage({ onNavigate, announcements }: SchoolHomepageProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  // Slides representing the authentic advertising banner parameters from the images
  const slides = [
    {
      title: "Dev Narayan Academy (DNA Classes)",
      subtitle: "Established in 2080 B.S. • Janakpur-11, Kishori Nagar",
      description: "Under the theme \"Your Education in DNA\", we offer specialized, top-performing coaching classrooms and assessment systems to ensure student excellence in secondary examinations and college entries.",
      image: campusImg,
      badge: "ESTABLISHED YEAR B.S. 2080",
      cta: "Log In Student Marks Portal"
    },
    {
      title: "Special SEE Prep Cohort for Gov't Students",
      subtitle: "Ensuring 100% Board Success & Scholar Standing",
      description: "Dedicated preparation batches for government school students, featuring free test syllabus booklets, monthly diagnostics, and direct cash scholarship rewards for the topmost academic rankers.",
      image: libraryImg,
      badge: "GOVERNMENT COHORT SCHOLARSHIPS",
      cta: "Read Active Notice Board"
    },
    {
      title: "Class 11 & 12 Specialized Math & Physics Tuition",
      subtitle: "Mentored & Instructed by Director Aatish Sah",
      description: "High-level conceptual lectures backed by structured question banks, regular diagnostic tests, paper reviews, and smart projection classroom equipment.",
      image: dnaLabImg,
      badge: "DIRECTED BY AATISH SAH",
      cta: "Check Candidate Report Card"
    },
    {
      title: "Interactive & Smart Audio-Visual Classrooms",
      subtitle: "Modern Visual Teaching & Concept Mapping Lectures",
      description: "We employ interactive state-of-the-art projection boards and high quality digital presentations to break down complex molecular, spatial, and geometrical formulas easily.",
      image: digitalLearnImg,
      badge: "AUDIO-VISUAL DIGITAL SUITE",
      cta: "Explore Study Worksheets"
    },
    {
      title: "Practical Chemistry & Biological Science Labs",
      subtitle: "Hands-on Scientific Demonstrations & Weekly Experiential Sessions",
      description: "Supplementing textbook theory with real practical experiments, laboratory simulations, and safe demonstrations in our state-certified educational workspace.",
      image: chemistryLabImg,
      badge: "PRACTICAL EXPERIMENTAL LABS",
      cta: "Check Lab Schedules"
    }
  ];

  // Auto-play interval
  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5500);

    return () => clearInterval(timer);
  }, [isPlaying, slides.length]);

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const activeAnnouncements = announcements.slice(0, 3);

  return (
    <div id="school-homepage-viewport" className="space-y-12">
      
      {/* 1. ADVERTISEMENT SLIDESHOW CAROUSEL */}
      <div id="school-homepage-carousel" className="relative h-[480px] bg-[#0A0A0A] border border-[#1A1A1A] overflow-hidden group">
        
        {/* Carousel image containers */}
        <div className="absolute inset-0 w-full h-full">
          {slides.map((slide, idx) => (
            <div
              id={`slide-wrapper-${idx}`}
              key={idx}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out flex flex-col justify-end ${
                currentSlide === idx ? 'opacity-100 z-10' : 'opacity-0 z-0'
              }`}
            >
              <div className="absolute inset-0 overflow-hidden bg-black">
                <img
                  id={`slide-img-${idx}`}
                  src={slide.image}
                  alt={slide.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover opacity-60 scale-105 transition-transform duration-[12000s]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/20" />
              </div>

              {/* Slide text panel */}
              <div className="relative z-20 p-6 md:p-12 max-w-3xl space-y-4">
                <span className="inline-block text-[9px] font-bold uppercase tracking-widest text-[#028A60] bg-[#028A60]/10 border border-[#028A60]/30 px-3 py-1 rounded-sm">
                  {slide.badge}
                </span>
                
                <h2 className="text-2xl md:text-4xl font-serif italic text-white tracking-tight leading-tight">
                  {slide.title}
                </h2>
                
                <p className="text-xs md:text-sm text-[#CCCCCC] font-serif italic leading-relaxed max-w-xl">
                  {slide.description}
                </p>

                <div className="pt-2 flex flex-wrap gap-4">
                  <button
                    id={`slide-cta-btn-${idx}`}
                    onClick={() => onNavigate('student')}
                    className="flex items-center gap-2 px-5 py-2.5 bg-[#028A60] hover:bg-[#02A875] text-[#0A0A0A] text-xs font-bold uppercase tracking-widest transition-all cursor-pointer font-mono"
                  >
                    {slide.cta}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  
                  <button
                    id={`slide-academic-info-${idx}`}
                    onClick={() => {
                      const el = document.getElementById('academy-highlights-strip');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="px-5 py-2.5 bg-[#141414]/90 hover:bg-[#1A1A1A] border border-[#222222] text-[#E2E2E2] text-xs font-medium uppercase tracking-wider font-mono cursor-pointer"
                  >
                    View Academy Focus
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Carousel arrows */}
        <button
          id="carousel-prev-btn"
          onClick={handlePrevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-2.5 bg-black/60 border border-[#222222] text-[#888888] hover:text-white hover:bg-black/90 transition-all cursor-pointer"
          aria-label="Previous Slide"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          id="carousel-next-btn"
          onClick={handleNextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-2.5 bg-black/60 border border-[#222222] text-[#888888] hover:text-white hover:bg-black/90 transition-all cursor-pointer"
          aria-label="Next Slide"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Carousel indicators */}
        <div className="absolute bottom-6 right-6 z-30 flex items-center gap-3">
          <button
            id="carousel-play-toggle"
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-1 text-[#888888] hover:text-white transition-all cursor-pointer"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>

          <div className="flex items-center gap-1.5">
            {slides.map((_, idx) => (
              <button
                id={`carousel-indicator-${idx}`}
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`w-7 h-1 transition-all rounded-xs ${
                  currentSlide === idx ? 'bg-[#028A60]' : 'bg-[#333333]'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* 2. CORE EDUCATION MISSION BAR */}
      <section id="academy-highlights-strip" className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-white p-8 border border-slate-200 rounded">
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-5 bg-[#028A60] rounded-xs inline-block"></span>
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#028A60]">Academy Focus</span>
          </div>
          <h3 className="text-xl md:text-2xl font-serif italic text-slate-900 tracking-tight">
            Comprehensive Science & Mathematics Guidance
          </h3>
          <p className="text-xs md:text-sm text-slate-600 leading-relaxed font-serif italic">
            Dev Narayan Academy (DNA Classes) is Janakpur-11's dedicated specialized tuition hub. We combine rigorous bi-weekly diagnostics, smart projection visualizations, and precise booklet study guides to groom Class 8-12 and SEE candidates into distinction-level performers.
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="flex items-start gap-2.5">
              <Microscope className="w-5 h-5 text-[#028A60] shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">Physical Science Practicals</h4>
                <p className="text-[11px] text-slate-500 mt-0.5 font-mono">Hands-on experiment guides, mechanics laws, and basic chemistry equipment logs.</p>
              </div>
            </div>
            
            <div className="flex items-start gap-2.5">
              <Award className="w-5 h-5 text-[#028A60] shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">DNA Scholar Fund</h4>
                <p className="text-[11px] text-slate-500 mt-0.5 font-mono">Cash scholarships, textbook hampers, and waived tuition for top test achievers.</p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <span className="text-[11px] text-slate-500 font-mono block">
              📢 CANDIDATES ASSESSMENT KEY: Weekly tests and mock boards scores sheets are live. Verify your status inside the Student Portal with your assigned Candidate ID.
            </span>
          </div>
        </div>

        {/* Highlight Curriculum Board */}
        <div className="lg:col-span-5 hidden lg:block bg-slate-50 p-6 border border-slate-200 rounded">
          <h4 className="text-[10px] font-bold tracking-widest uppercase font-mono text-[#028A60] mb-3">Admission & Course Packages</h4>
          <ul className="space-y-3.5 text-xs text-slate-600 font-mono">
            <li className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span>● Class 8, 9, & 10 Regular</span>
              <span className="text-slate-900 font-bold">Admissions Live</span>
            </li>
            <li className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span>● Gov't Pupils SEE Special Batch</span>
              <span className="text-amber-600 font-bold">Subsidized Cohort</span>
            </li>
            <li className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span>● Class 11 Math & Physics</span>
              <span className="text-slate-900 font-bold">Aatish Sah Lectures</span>
            </li>
            <li className="flex items-center justify-between">
              <span>● Class 12 Boards Prep</span>
              <span className="text-[#028A60] font-bold">Intensive Drills</span>
            </li>
          </ul>
        </div>
      </section>

      {/* 3. CORE DEMOGRAPHICS STATS */}
      <section id="academic-excellence-slate" className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { metric: "Est. 2080 B.S.", label: "CALENDAR ESTABLISHED", desc: "Coaching Janakpur communities" },
          { metric: "Grade 8-12", label: "TUTORIAL CLASSES", desc: "Specializing in board curriculums" },
          { metric: "Upto 100%", label: "SCHOLARSHIP SYSTEM", desc: "Awarded to topmost performers" },
          { metric: "100%", label: "SEE RE-PREP STANDING", desc: "High success for government batches" }
        ].map((item, idx) => (
          <div id={`metric-card-${idx}`} key={idx} className="bg-white p-5 border border-slate-200 rounded text-center space-y-1">
            <span className="block text-xl font-serif text-[#028A60] italic font-bold">
              {item.metric}
            </span>
            <span className="block text-[9px] font-mono font-bold tracking-widest text-[#1e293b] uppercase">
              {item.label}
            </span>
            <span className="block text-[10px] text-slate-500 font-serif italic">
              {item.desc}
            </span>
          </div>
        ))}
      </section>

      {/* 4. ANNOUNCEMENTS AND BENTO BLOCK */}
      <div id="school-homepage-notices-grid" className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left column: Academic Alerts */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#028A60]">Official Gazette Notices</span>
            <button
              id="goto-all-student-notices-btn"
              onClick={() => onNavigate('student')}
              className="text-[10px] font-mono font-bold uppercase hover:text-slate-900 text-slate-400 cursor-pointer"
            >
              View Board
            </button>
          </div>

          <div className="space-y-4">
            {activeAnnouncements.length === 0 ? (
              <p className="text-xs text-slate-400 font-mono italic">No academy announcements active at present.</p>
            ) : (
              activeAnnouncements.map((ann, idx) => (
                <div id={`homepage-ann-row-${idx}`} key={ann.id} className="p-4 bg-white border border-slate-200 rounded-lg hover:border-[#028A60]/50 transition-colors shadow-xs">
                  <div className="flex items-center justify-between gap-2 text-[10px] font-mono text-slate-500">
                    <span className="uppercase bg-slate-100 px-2 py-0.5 border border-slate-200 text-[#028A60] rounded">
                      {ann.category}
                    </span>
                    <span>{ann.date}</span>
                  </div>
                  <h4 className="text-sm font-serif italic text-slate-800 mt-2">
                    {ann.title}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                    {ann.content}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right column: Amenities & Infrastructures */}
        <div className="lg:col-span-6 space-y-4">
          <span className="block text-[10px] font-mono font-bold uppercase tracking-widest text-[#028A60] border-b border-slate-200 pb-3">
            Academy Infrastructure & Amenities
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white p-5 border border-slate-200 hover:border-slate-300 transition-all rounded-lg shadow-xs">
              <Compass className="w-6 h-6 text-[#028A60] mb-3" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">Advanced Mathematics</h4>
              <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed font-mono">Specializing in compounding, geometry proofs, coordinates equations, and boards revision sheets.</p>
            </div>

            <div className="bg-white p-5 border border-slate-200 hover:border-slate-300 transition-all rounded-lg shadow-xs">
              <Microscope className="w-6 h-6 text-[#028A60] mb-3" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">Visual Physics Coaching</h4>
              <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed font-serif italic">Vectors mechanics, thermodynamics equations, and optics concepts taught by Aatish Sah.</p>
            </div>

            <div className="bg-white p-5 border border-slate-200 hover:border-slate-300 transition-all rounded-lg shadow-xs">
              <Laptop className="w-6 h-6 text-[#028A60] mb-3" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">Smart visual aids</h4>
              <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed font-serif italic">Custom animation presentations to break down organic chemistry structures and mathematics formulas.</p>
            </div>

            <div className="bg-white p-5 border border-slate-200 hover:border-slate-300 transition-all rounded-lg shadow-xs">
              <GraduationCap className="w-6 h-6 text-[#028A60] mb-3" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">Career & Board Guidance</h4>
              <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed font-serif italic">Dedicated counselling and preparation sessions focused on engineering & medicine entries.</p>
            </div>
          </div>
        </div>
      </div>

      {/* 5. SHORTCUT PORTAL ENTRIES */}
      <section id="homepage-dashboard-promos" className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-200">
        {/* Student CTA */}
        <div className="bg-gradient-to-r from-white to-slate-50 p-6 border-l-4 border-[#028A60] border-t border-b border-r border-slate-200 rounded-lg flex flex-col justify-between shadow-xs">
          <div className="space-y-2">
            <span className="text-[9px] uppercase font-mono tracking-widest text-[#028A60] font-bold">SECURE STUDENT TRANSCRIPTS</span>
            <h4 className="text-base font-serif italic text-slate-800">Access Student Marksheet Ledger</h4>
            <p className="text-xs text-slate-500 font-serif italic">Students and parents can log in using their Roll card credential ID & Password to view individual marks sheets and comments privately.</p>
          </div>
          <button
            id="hp-goto-student-btn"
            onClick={() => onNavigate('student')}
            className="mt-4 self-start text-xs font-bold text-slate-800 hover:text-[#02A875] uppercase tracking-widest flex items-center gap-1.5 font-mono cursor-pointer"
          >
            Authenticate Roll Credentials
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Teacher CTA */}
        <div className="bg-gradient-to-r from-white to-slate-50 p-6 border-l-4 border-[#47b282] border-t border-b border-r border-slate-200 rounded-lg flex flex-col justify-between shadow-xs">
          <div className="space-y-2">
            <span className="text-[9px] uppercase font-mono tracking-widest text-[#028A60] font-bold">EDUCATOR INTERFACE</span>
            <h4 className="text-base font-serif italic text-slate-800">Head Admin & Instructor Console</h4>
            <p className="text-xs text-slate-500 font-serif italic">Authorized teachers and administrators can post alerts, manage grades tables, add students, and integrate spreadsheet ledger files securely.</p>
          </div>
          <button
            id="hp-goto-teacher-btn"
            onClick={() => onNavigate('teacher')}
            className="mt-4 self-start text-xs font-bold text-slate-800 hover:text-[#028A60] uppercase tracking-widest flex items-center gap-1.5 font-mono cursor-pointer"
          >
            Log In Teacher Dash
            <Lock className="w-3 h-3 text-[#028A60]" />
          </button>
        </div>
      </section>

    </div>
  );
}
