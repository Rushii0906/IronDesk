import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Dumbbell, Clock, MapPin, Phone, MessageSquare, Mail, ChevronRight, Check, Award, Activity, Shield, ExternalLink } from 'lucide-react';

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState('home');
  const [plans, setPlans] = useState([]);
  const [plansLoading, setPlansLoading] = useState(true);

  // Form states
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactSubject, setContactSubject] = useState('Membership Inquiry');
  const [contactMessage, setContactMessage] = useState('');

  // Fetch plans dynamically from the public API endpoint with automated 5s polling updates
  useEffect(() => {
    const fetchPublicPlans = async () => {
      try {
        const res = await fetch('/api/plans');
        if (res.ok) {
          const data = await res.json();
          setPlans(data);
        }
      } catch (err) {
        console.error('Failed to load plans:', err);
      } finally {
        setPlansLoading(false);
      }
    };

    fetchPublicPlans();

    // Keep the plans list fresh by polling every 5 seconds
    const interval = setInterval(fetchPublicPlans, 5000);
    return () => clearInterval(interval);
  }, []);

  // Convert contact form submission to a local mailto redirect
  const handleContactSubmit = (e) => {
    e.preventDefault();
    const body = `Name: ${contactName}\nEmail: ${contactEmail}\n\nMessage:\n${contactMessage}`;
    const mailtoUrl = `mailto:info@ironchamber.com?subject=${encodeURIComponent(contactSubject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoUrl;
  };

  const selectPlanForInquiry = (plan) => {
    setContactSubject(`Inquiry for ${plan.name}`);
    setContactMessage(`Hi Iron Chamber team, I'm interested in signing up for the ${plan.name} plan (${plan.duration_months} Months - ₹${plan.price}). Please share details on joining. Thanks!`);
    setActiveTab('contact');
  };

  return (
    <div className="min-h-screen bg-gym-bg text-gray-100 font-sans flex flex-col justify-between selection:bg-gym-accent selection:text-black">
      
      {/* HEADER / NAVIGATION */}
      <header className="border-b border-gym-border bg-gym-bg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          {/* Brand logo */}
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => setActiveTab('home')}>
            <div className="w-9 h-9 bg-gym-accent bg-opacity-10 rounded-xl flex items-center justify-center border border-gym-accent border-opacity-35">
              <Dumbbell className="w-5 h-5 text-gym-accent" />
            </div>
            <span className="text-xl font-display font-bold tracking-wider text-white">
              IRON<span className="text-gym-accent font-display">CHAMBER</span>
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex space-x-1">
            {['home', 'plans', 'about', 'timings', 'contact'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold uppercase tracking-wider transition-colors duration-150 ${
                  activeTab === tab
                    ? 'text-gym-accent'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {tab === 'timings' ? 'Timings & Location' : tab}
              </button>
            ))}
          </nav>

          {/* CTA */}
          <button
            onClick={() => setActiveTab('plans')}
            className="h-10 px-5 bg-gym-accent hover:bg-gym-accentHover text-black font-semibold rounded-xl text-sm flex items-center justify-center transition-all duration-150 active:scale-95 shadow-[0_4px_12px_rgba(242,169,59,0.2)]"
          >
            Join Gym
          </button>
        </div>
      </header>

      {/* MOBILE NAV BAR */}
      <nav className="md:hidden border-b border-gym-border bg-gym-panel flex justify-around py-3 sticky top-20 z-40">
        {['home', 'plans', 'about', 'contact'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`text-xs font-bold uppercase tracking-wider ${
              activeTab === tab ? 'text-gym-accent' : 'text-gray-400'
            }`}
          >
            {tab}
          </button>
        ))}
      </nav>

      {/* CONTENT PAGES CONTAINER */}
      <main className="flex-grow">
        
        {/* 1. HOME TAB */}
        {activeTab === 'home' && (
          <div className="animate-fadeIn">
            {/* Hero */}
            <section className="relative py-20 md:py-28 max-w-7xl mx-auto px-6 text-center lg:text-left lg:grid lg:grid-cols-12 lg:gap-12 lg:items-center">
              <div className="lg:col-span-7 space-y-6">
                <div className="inline-flex items-center space-x-2 bg-gym-accent bg-opacity-10 border border-gym-accent border-opacity-25 px-3 py-1.5 rounded-full text-gym-accent text-xs font-semibold uppercase tracking-wider">
                  <Activity className="w-3.5 h-3.5" />
                  <span>No Excuses. Just Results.</span>
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-white tracking-tight leading-[1.1]">
                  FORGE YOUR <span className="text-gym-accent font-display">ULTIMATE</span> SELF.
                </h1>
                <p className="text-gray-400 text-base md:text-lg max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium">
                  At Iron Chamber, we offer a raw, results-driven training atmosphere. No fluff, no distractions. Just premium iron, top-tier coaching, and a community built on grit.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
                  <button
                    onClick={() => setActiveTab('plans')}
                    className="w-full sm:w-auto h-12 bg-gym-accent hover:bg-gym-accentHover text-black font-bold rounded-xl px-8 flex items-center justify-center space-x-2 transition-all duration-150 shadow-[0_4px_16px_rgba(242,169,59,0.3)] active:scale-95"
                  >
                    <span>View Pricing Plans</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setActiveTab('timings')}
                    className="w-full sm:w-auto h-12 border border-gym-border hover:border-gray-500 bg-transparent hover:bg-gym-panel text-gray-300 font-semibold rounded-xl px-6 flex items-center justify-center transition-colors duration-150 active:scale-95"
                  >
                    Hours & Location
                  </button>
                </div>
              </div>

              {/* Graphic container */}
              <div className="hidden lg:block lg:col-span-5 relative">
                <div className="absolute inset-0 bg-gym-accent rounded-full opacity-5 blur-[100px] -z-10"></div>
                <div className="bg-[#1D1F25] border border-gym-border rounded-2xl shadow-2xl p-6 relative overflow-hidden transform rotate-2 max-w-sm mx-auto">
                  <div className="w-12 h-12 rounded-xl bg-gym-accent bg-opacity-10 flex items-center justify-center mb-4">
                    <Award className="w-6 h-6 text-gym-accent" />
                  </div>
                  <h3 className="text-xl font-display font-bold text-white mb-2">Premium Strength</h3>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Designed for lift-focused enthusiasts. Access Olympic bars, massive dumbbell piles, and dedicated lifting platforms.
                  </p>
                  <div className="mt-5 pt-4 border-t border-[#24262E] flex justify-between items-center text-xs text-gym-accent font-semibold">
                    <span>Lifting Platforms</span>
                    <span>10+ Racks</span>
                  </div>
                </div>
              </div>
            </section>

            {/* highlights */}
            <section className="bg-gym-panel border-y border-gym-border py-16">
              <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-3">
                  <div className="w-10 h-10 bg-gym-accent bg-opacity-10 rounded-xl flex items-center justify-center text-gym-accent">
                    <Dumbbell className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-display font-bold text-white">Elite Weight Room</h3>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Dumbbells up to 150 lbs, bumper plates, power racks, specialized bars, and selected plate-loaded machines.
                  </p>
                </div>
                <div className="space-y-3">
                  <div className="w-10 h-10 bg-gym-accent bg-opacity-10 rounded-xl flex items-center justify-center text-gym-accent">
                    <Shield className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-display font-bold text-white">No-Nonsense Facility</h3>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Focused purely on athletic progression. Clean environment, loud music, and members committed to training.
                  </p>
                </div>
                <div className="space-y-3">
                  <div className="w-10 h-10 bg-gym-accent bg-opacity-10 rounded-xl flex items-center justify-center text-gym-accent">
                    <Clock className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-display font-bold text-white">Convenient Access</h3>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Open early mornings and late nights to fit any schedule. Quick check-ins and shared front desk logging.
                  </p>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* 2. PLANS TAB */}
        {activeTab === 'plans' && (
          <div className="max-w-7xl mx-auto px-6 py-16 animate-fadeIn space-y-12">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <h2 className="text-3xl font-display font-bold text-white tracking-wide">
                MEMBERSHIP <span className="text-gym-accent font-display">PRICING</span>
              </h2>
              <p className="text-gray-400 text-sm">
                Choose the training term that fits your goal. Dynamic rates pulled direct from front desk logs.
              </p>
            </div>

            {plansLoading ? (
              <div className="flex flex-col items-center justify-center py-20 space-y-2">
                <div className="w-8 h-8 border-4 border-gym-accent border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-500 text-xs uppercase tracking-wider font-semibold">Syncing current prices...</p>
              </div>
            ) : plans.length === 0 ? (
              <div className="bg-gym-panel border border-gym-border rounded-2xl p-12 text-center max-w-md mx-auto">
                <Dumbbell className="w-8 h-8 text-gray-600 mx-auto mb-3" />
                <h4 className="font-semibold text-white">No plans online</h4>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                  We are updating our plan structures. Please contact the front desk directly for pricing.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
                {plans.map((p) => (
                  <div
                    key={p.id}
                    className="bg-gym-panel border border-gym-border hover:border-gym-accent transition-all duration-200 rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden shadow-lg group"
                  >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gym-accent rounded-full opacity-5 blur-[40px]"></div>
                    <div>
                      <h3 className="text-xl font-display font-bold text-white">{p.name}</h3>
                      <div className="mt-4 flex items-baseline text-white">
                        <span className="text-4xl font-display font-bold tracking-tight">₹{p.price.toLocaleString('en-IN')}</span>
                        <span className="ml-2 text-xs font-semibold text-gray-500 uppercase tracking-widest">
                          / {p.duration_months} {p.duration_months === 1 ? 'Month' : 'Months'}
                        </span>
                      </div>
                      <p className="text-gray-400 text-xs mt-3 leading-relaxed">
                        Full access to all strength equipment, conditioning tools, turf, and locker rooms during operations hours.
                      </p>
                      
                      <ul className="mt-6 space-y-2 text-xs text-gray-300">
                        <li className="flex items-center space-x-2">
                          <Check className="w-4 h-4 text-gym-activeText" />
                          <span>No sign-up lock-in fees</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <Check className="w-4 h-4 text-gym-activeText" />
                          <span>Plate-Loaded Machines & Dumbbells</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <Check className="w-4 h-4 text-gym-activeText" />
                          <span>Free Fitness Assessment</span>
                        </li>
                      </ul>
                    </div>

                    <button
                      onClick={() => selectPlanForInquiry(p)}
                      className="mt-8 w-full h-11 bg-[#24262E] hover:bg-gym-accent group-hover:bg-gym-accent hover:text-black group-hover:text-black border border-gym-border text-white font-semibold rounded-xl text-xs uppercase tracking-wider transition-colors duration-150"
                    >
                      Inquire / Join
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 3. ABOUT TAB */}
        {activeTab === 'about' && (
          <div className="max-w-7xl mx-auto px-6 py-16 animate-fadeIn space-y-12">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <h2 className="text-3xl font-display font-bold text-white tracking-wide">
                THE <span className="text-gym-accent font-display">FACILITY</span>
              </h2>
              <p className="text-gray-400 text-sm">
                Take a look at what drives the physical progress in the Chamber.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              <div className="bg-gym-panel border border-gym-border rounded-2xl p-6 space-y-3 relative overflow-hidden">
                <span className="text-xs uppercase font-bold text-gym-accent tracking-widest">Strength Room</span>
                <h3 className="text-xl font-display font-bold text-white">Heavy Iron Deck</h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Our facility centers around free weight lifting. We feature 4 full power racks, 2 specialized bench platforms, bumper sets, custom bars (trap bar, safety bar, cambered bar), and dumbbells starting at 5 lbs going all the way up to 150 lbs.
                </p>
              </div>

              <div className="bg-gym-panel border border-gym-border rounded-2xl p-6 space-y-3 relative overflow-hidden">
                <span className="text-xs uppercase font-bold text-gym-accent tracking-widest">Conditioning</span>
                <h3 className="text-xl font-display font-bold text-white">Functional Turf Area</h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  A dedicated 30-foot sled turf equipped with heavy friction sleds, dual kettlebell packs, battle ropes, medicine balls, and high-performance cardio builders (Air Assault Bikes and Rowing Ergs).
                </p>
              </div>

              <div className="bg-gym-panel border border-gym-border rounded-2xl p-6 space-y-3 relative overflow-hidden">
                <span className="text-xs uppercase font-bold text-gym-accent tracking-widest">Coaching Staff</span>
                <h3 className="text-xl font-display font-bold text-white">Certified Trainers</h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Our coaches don't count reps — they build technique. Standard membership includes entry-level programming guidance, with options for direct 1-on-1 athletic coaching and diet scheduling.
                </p>
              </div>

              <div className="bg-gym-panel border border-gym-border rounded-2xl p-6 space-y-3 relative overflow-hidden">
                <span className="text-xs uppercase font-bold text-gym-accent tracking-widest">Community</span>
                <h3 className="text-xl font-display font-bold text-white">The Training Crew</h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  No distractions. Iron Chamber is packed with lifters who respect the gym rules: re-rack your plates, wipe your benches, support other members, and come ready to sweat.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 4. TIMINGS TAB */}
        {activeTab === 'timings' && (
          <div className="max-w-7xl mx-auto px-6 py-16 animate-fadeIn space-y-12">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <h2 className="text-3xl font-display font-bold text-white tracking-wide">
                HOURS & <span className="text-gym-accent font-display">LOCATION</span>
              </h2>
              <p className="text-gray-400 text-sm">
                Drop by for a training session or audit our facilities.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto items-stretch">
              {/* Hours Card */}
              <div className="bg-gym-panel border border-gym-border rounded-2xl p-6 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-display font-bold text-white mb-4 flex items-center space-x-2">
                    <Clock className="w-5 h-5 text-gym-accent" />
                    <span>Operating Hours</span>
                  </h3>
                  <div className="space-y-3 text-xs text-gray-300">
                    <div className="flex justify-between border-b border-[#24262E] pb-2">
                      <span className="font-semibold">Monday - Friday</span>
                      <span className="font-mono">5:00 AM - 10:00 PM</span>
                    </div>
                    <div className="flex justify-between border-b border-[#24262E] pb-2">
                      <span className="font-semibold">Saturday</span>
                      <span className="font-mono">6:00 AM - 8:00 PM</span>
                    </div>
                    <div className="flex justify-between pb-1">
                      <span className="font-semibold">Sunday</span>
                      <span className="font-mono">8:00 AM - 2:00 PM</span>
                    </div>
                  </div>
                </div>

                <div className="mt-8 border-t border-[#24262E] pt-4">
                  <h4 className="text-xs uppercase font-bold text-gray-500 tracking-wider">Note</h4>
                  <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">
                    National holidays may impact timings. Expiry alerts and check-ins are logged at the front desk desk during all operations hours.
                  </p>
                </div>
              </div>

              {/* Location Card */}
              <div className="bg-gym-panel border border-gym-border rounded-2xl p-6 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-display font-bold text-white mb-4 flex items-center space-x-2">
                    <MapPin className="w-5 h-5 text-gym-accent" />
                    <span>Our Location</span>
                  </h3>
                  <p className="text-xs text-gray-300 leading-relaxed font-semibold">
                    Iron Chamber Gym<br/>
                    123 Powerhouse Street, Sector 5<br/>
                    Gym City, PIN 560001
                  </p>
                  <p className="text-xs text-gray-400 mt-3 leading-relaxed">
                    Conveniently located near the Central Transit Station. Free parking is available for members for up to 2 hours.
                  </p>
                </div>

                <div className="mt-8">
                  <a
                    href="https://maps.google.com/?q=Iron+Chamber+Gym+123+Powerhouse"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full h-11 bg-[#24262E] hover:bg-[#2C2E37] border border-gym-border text-white text-xs font-semibold rounded-xl flex items-center justify-center space-x-2 transition-colors duration-150 active:scale-95"
                  >
                    <span>Open in Google Maps</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 5. CONTACT TAB */}
        {activeTab === 'contact' && (
          <div className="max-w-7xl mx-auto px-6 py-16 animate-fadeIn space-y-12">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <h2 className="text-3xl font-display font-bold text-white tracking-wide">
                GET IN <span className="text-gym-accent font-display">TOUCH</span>
              </h2>
              <p className="text-gray-400 text-sm">
                Have questions about memberships or facilities? Send us an inquiry.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-4xl mx-auto items-start">
              {/* Direct channels */}
              <div className="lg:col-span-5 space-y-4">
                <div className="bg-gym-panel border border-gym-border rounded-2xl p-5 space-y-4">
                  <h3 className="font-display font-bold text-white text-sm uppercase tracking-wider">Direct Connect</h3>
                  
                  <div className="space-y-3 text-xs">
                    <a 
                      href="https://wa.me/919999999999?text=Hi,%20I'm%20interested%20in%20joining%20Iron%20Chamber%20Gym."
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-3 p-3 rounded-xl bg-[#25D366] bg-opacity-5 hover:bg-opacity-10 border border-[#25D366] border-opacity-10 text-[#25D366] transition-all duration-150"
                    >
                      <MessageSquare className="w-4 h-4 flex-shrink-0" />
                      <div>
                        <p className="font-bold">WhatsApp Business</p>
                        <p className="text-[10px] text-gray-400 font-mono mt-0.5">+91 99999 99999</p>
                      </div>
                    </a>

                    <div className="flex items-center space-x-3 p-3 rounded-xl bg-[#24262E] border border-gym-border text-white">
                      <Phone className="w-4 h-4 text-gym-accent flex-shrink-0" />
                      <div>
                        <p className="font-bold text-gray-300">Front Desk Helpline</p>
                        <p className="text-[10px] text-gray-400 font-mono mt-0.5">+91 11 2233 4455</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 p-3 rounded-xl bg-[#24262E] border border-gym-border text-white">
                      <Mail className="w-4 h-4 text-gym-accent flex-shrink-0" />
                      <div>
                        <p className="font-bold text-gray-300">Email Inquiry</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">info@ironchamber.com</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Form */}
              <div className="lg:col-span-7 bg-gym-panel border border-gym-border rounded-2xl p-5 shadow-xl">
                <h3 className="font-display font-bold text-white text-sm uppercase tracking-wider mb-4">Membership Form</h3>
                
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-gray-500 tracking-wider mb-1.5">Full Name</label>
                      <input
                        type="text"
                        required
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                        placeholder="e.g. John Doe"
                        className="w-full h-11 bg-[#24262E] border border-gym-border rounded-xl px-4 text-sm text-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-gray-500 tracking-wider mb-1.5">Email Address</label>
                      <input
                        type="email"
                        required
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        placeholder="e.g. john@example.com"
                        className="w-full h-11 bg-[#24262E] border border-gym-border rounded-xl px-4 text-sm text-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-500 tracking-wider mb-1.5">Subject</label>
                    <input
                      type="text"
                      required
                      value={contactSubject}
                      onChange={(e) => setContactSubject(e.target.value)}
                      className="w-full h-11 bg-[#24262E] border border-gym-border rounded-xl px-4 text-sm text-white focus:outline-none font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-500 tracking-wider mb-1.5">Inquiry Details</label>
                    <textarea
                      rows={4}
                      required
                      value={contactMessage}
                      onChange={(e) => setContactMessage(e.target.value)}
                      placeholder="Share details on your fitness goal or selected plan..."
                      className="w-full bg-[#24262E] border border-gym-border rounded-xl p-4 text-sm text-white focus:outline-none resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full h-11 bg-gym-accent hover:bg-gym-accentHover text-black font-bold rounded-xl transition-all duration-150 shadow-[0_4px_12px_rgba(242,169,59,0.25)] flex items-center justify-center text-xs uppercase tracking-wider active:scale-95"
                  >
                    Send Message (Mail)
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="border-t border-gym-border bg-gym-panel py-8 mt-12 text-center text-xs text-gray-500">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-gym-accent bg-opacity-10 rounded-lg flex items-center justify-center border border-gym-accent border-opacity-30">
              <Dumbbell className="w-3.5 h-3.5 text-gym-accent" />
            </div>
            <span className="font-display font-bold tracking-wider text-white text-sm">
              IRON<span className="text-gym-accent font-display">CHAMBER</span>
            </span>
          </div>
          <p>&copy; {new Date().getFullYear()} Iron Chamber Systems. All rights reserved.</p>
          <div className="flex items-center space-x-4">
            <span className="hover:text-gray-400 cursor-pointer">Operating Rules</span>
            <span>&bull;</span>
            <Link 
              to="/app" 
              className="text-gray-600 hover:text-gym-accent hover:underline font-semibold"
            >
              Admin Login
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
