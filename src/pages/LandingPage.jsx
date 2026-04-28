import React from 'react';
import { motion } from 'framer-motion';
import { 
  ChevronRight, 
  Car, 
  ShieldCheck, 
  Smartphone, 
  BarChart3, 
  Users, 
  Clock,
  ArrowRight,
  Shield,
  Zap,
  Globe,
  Database,
  Check
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import GlassCard from '../components/ui/GlassCard';
import VideoModal from '../components/ui/VideoModal';

// Section Header Component
const SectionHeader = ({ title, subtitle, centered = true }) => (
  <div style={{ 
    textAlign: centered ? 'center' : 'left', 
    marginBottom: '4rem',
    maxWidth: centered ? '800px' : '100%',
    marginInline: centered ? 'auto' : '0'
  }}>
    <motion.h2 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      style={{ 
        fontSize: 'clamp(2rem, 5vw, 3rem)', 
        fontWeight: '800', 
        color: 'white',
        lineHeight: '1.2',
        marginBottom: '1.5rem',
        background: 'var(--text-gradient)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent'
      }}
    >
      {title}
    </motion.h2>
    <motion.p 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: 0.1 }}
      style={{ fontSize: '1.25rem', color: 'var(--slate-400)', lineHeight: '1.6' }}
    >
      {subtitle}
    </motion.p>
  </div>
);

const LandingPage = () => {
  const [isVideoModalOpen, setIsVideoModalOpen] = React.useState(false);

  return (
    <div style={{ 
      backgroundColor: 'var(--obsidian-black)', 
      color: 'white', 
      minHeight: '100vh', 
      fontFamily: 'var(--font-main)',
      scrollBehavior: 'smooth'
    }}>
      <VideoModal 
        isOpen={isVideoModalOpen} 
        onClose={() => setIsVideoModalOpen(false)} 
      />
      {/* Navigation */}
      <header style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        right: 0, 
        height: '80px', 
        zIndex: 100,
        backdropFilter: 'blur(16px)',
        backgroundColor: 'rgba(2, 6, 23, 0.7)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 5vw'
      }}>
        <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--blue-500)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Car size={32} />
          <span>Valet<span style={{ color: 'var(--amber-gold)' }}>Pro</span></span>
        </div>
        
        <nav style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '2rem' }}>
          {['Features', 'How it Works', 'Pricing'].map(item => (
            <a key={item} href={`#${item.toLowerCase().replace(/ /g, '-')}`} style={{ 
              color: 'var(--slate-400)', 
              textDecoration: 'none', 
              fontSize: '0.9rem', 
              fontWeight: '600',
              transition: 'color 0.2s ease'
            }} onMouseOver={e => e.target.style.color = 'white'} onMouseOut={e => e.target.style.color = 'var(--slate-400)'}>
              {item}
            </a>
          ))}
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginLeft: '1rem' }}>
            <Link to="/login" style={{ textDecoration: 'none' }}>
              <Button variant="ghost" style={{ color: 'white', fontWeight: '600' }}>
                Sign In
              </Button>
            </Link>
            <Link to="/signup" style={{ textDecoration: 'none' }}>
              <Button variant="accent" style={{ 
                borderRadius: '100px', 
                padding: '0.6rem 1.75rem', 
                boxShadow: '0 10px 15px -3px rgba(245, 158, 11, 0.25)',
                border: 'none',
                backgroundColor: 'var(--amber-gold)',
                color: 'var(--obsidian-black)',
                fontWeight: '700'
              }}>
                Sign Up
              </Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section style={{ 
        padding: '12rem 5vw 8rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ 
          position: 'absolute', 
          top: '10%', 
          left: '50%', 
          transform: 'translateX(-50%)', 
          width: '80vw', 
          height: '40vh', 
          background: 'radial-gradient(circle, rgba(37, 99, 235, 0.15) 0%, transparent 70%)',
          zIndex: 0,
          pointerEvents: 'none'
        }}></div>

        <motion.div
           initial={{ opacity: 0, y: 30 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.8 }}
           style={{ zIndex: 1 }}
        >
          <div style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '0.5rem', 
            padding: '0.5rem 1rem', 
            borderRadius: '100px', 
            backgroundColor: 'rgba(37, 99, 235, 0.1)', 
            border: '1px solid rgba(37, 99, 235, 0.2)', 
            color: 'var(--blue-500)',
            fontSize: '0.875rem',
            fontWeight: '600',
            marginBottom: '2rem'
          }}>
            <Zap size={16} />
            <span>Introducing v2.0 - Real-time Fleet Tracking</span>
          </div>

          <h1 style={{ 
            fontSize: 'clamp(3rem, 8vw, 5rem)', 
            fontWeight: '900', 
            lineHeight: '1.2', 
            letterSpacing: '-0.02em',
            marginBottom: '2rem',
            paddingBottom: '0.2em',
            background: 'linear-gradient(to bottom, #ffffff 40%, rgba(255,255,255,0.7) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Valet Parking, <br />
            <span style={{ 
              color: 'var(--amber-gold)',
              WebkitTextFillColor: 'var(--amber-gold)' 
            }}>Reimagined.</span>
          </h1>

          <p style={{ 
            fontSize: '1.25rem', 
            color: 'var(--slate-400)', 
            maxWidth: '640px', 
            margin: '0 auto 3rem',
            lineHeight: '1.6'
          }}>
            The ultra-modern digital valet platform for world-class venues. 
            Eliminate tickets, prevent fraud, and delight your guests with real-time tracking.
          </p>

          <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' }}>
            <Link to="/signup" style={{ textDecoration: 'none' }}>
              <Button variant="accent" style={{ 
                padding: '1rem 2.5rem', 
                fontSize: '1.1rem', 
                borderRadius: '100px',
                backgroundColor: 'var(--amber-gold)',
                color: 'var(--obsidian-black)',
                fontWeight: '700',
                boxShadow: '0 10px 20px -5px rgba(245, 158, 11, 0.3)'
              }}>
                Get Started for Free
                <ArrowRight size={20} />
              </Button>
            </Link>
            <Button 
              variant="outline" 
              onClick={() => setIsVideoModalOpen(true)}
              style={{ 
                padding: '1rem 2.5rem', 
                fontSize: '1.1rem', 
                borderRadius: '100px', 
                borderColor: 'rgba(255,255,255,0.2)',
                color: 'white',
                fontWeight: '600',
                backgroundColor: 'rgba(255,255,255,0.05)'
              }}
            >
              Watch Demo
            </Button>
          </div>
        </motion.div>
      </section>

      {/* Stats Bar */}
      <section style={{ padding: '4rem 5vw', backgroundColor: 'var(--obsidian-elevated)' }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '2rem', 
          maxWidth: '1200px', 
          margin: '0 auto' 
        }}>
          {[
            { label: 'Vehicles Handled', value: '1.2M+' },
            { label: 'Venue Partnerships', value: '450+' },
            { label: 'Fraud Reduction', value: '99.9%' },
            { label: 'Average Uptime', value: '99.99%' },
          ].map((stat, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '0.5rem', color: 'white' }}>{stat.value}</div>
              <div style={{ color: 'var(--slate-400)', fontSize: '0.9rem', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section id="features" style={{ padding: '10rem 5vw' }}>
        <SectionHeader 
          title="Engineered for Performance" 
          subtitle="Everything you need to manage elite valet operations at scale, with precision and security."
        />

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
          gap: '1.5rem', 
          maxWidth: '1200px', 
          margin: '0 auto' 
        }}>
          {[
            { icon: Smartphone, title: 'Digital Tokens', desc: 'No more paper waste. Guests receive immediate digital tracking tokens via SMS.' },
            { icon: BarChart3, title: 'Real-time Analytics', desc: 'Monitor peak hours, revenue, and staff performance in high-fidelity dashboards.' },
            { icon: ShieldCheck, title: 'Fraud Prevention', desc: 'Digital logs ensure 100% accountability for every vehicle movement and key handover.' },
            { icon: Globe, title: 'Multi-Venue Control', desc: 'Manage unlimited venues from a single platform admin account with localized control.' },
            { icon: Clock, title: 'Live Live Tracking', desc: 'Guests can see their car status and request retrieval with a single tap on their device.' },
            { icon: Database, title: 'Photo Evidence', desc: 'Integrated damage reporting with photo capture to protect against false claims.' },
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <GlassCard style={{ 
                height: '100%', 
                padding: '2.5rem', 
                border: '1px solid rgba(255,255,255,0.08)',
                background: 'rgba(255, 255, 255, 0.03)',
                backdropFilter: 'blur(12px)'
              }}>
                <div style={{ 
                  width: '56px', 
                  height: '56px', 
                  borderRadius: '16px', 
                  backgroundColor: 'rgba(37, 99, 235, 0.15)', 
                  color: 'var(--blue-500)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  marginBottom: '1.5rem',
                  border: '1px solid rgba(37, 99, 235, 0.2)'
                }}>
                  <feature.icon size={26} />
                </div>
                <h3 style={{ fontSize: '1.35rem', fontWeight: '800', marginBottom: '1rem', color: 'white' }}>{feature.title}</h3>
                <p style={{ color: 'var(--slate-300)', lineHeight: '1.7', fontSize: '0.95rem' }}>{feature.desc}</p>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" style={{ padding: '10rem 5vw', backgroundColor: 'var(--obsidian-elevated)' }}>
        <SectionHeader 
          title="Simple, Transparent Pricing" 
          subtitle="Choose the perfect plan for your venue size and operational complexity."
        />

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: '2rem', 
          maxWidth: '1200px', 
          margin: '0 auto' 
        }}>
          {[
            { 
              tier: 'Starter', 
              price: '₹7,999', 
              desc: 'For small boutiques and restaurants.', 
              features: ['Up to 500 cars/mo', 'Digital SMS Tokens', 'Basic Analytics', 'Standard Support'] 
            },
            { 
              tier: 'Pro', 
              price: '₹14,999', 
              desc: 'For hotels and major shopping malls.', 
              featured: true,
              features: ['Unlimited cars/mo', 'Advanced Real-time Tracking', 'Custom Branding', 'Email & Chat Support'] 
            },
            { 
              tier: 'Enterprise', 
              price: 'Custom', 
              desc: 'For multi-venue hotel chains.', 
              features: ['Multi-tenant Management', 'API Access', 'White-label Mobile App', 'Dedicated Account Manager'] 
            },
          ].map((plan, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              style={{ position: 'relative' }}
            >
              <GlassCard style={{ 
                height: '100%', 
                padding: '3rem 2rem', 
                border: plan.featured ? '2px solid var(--blue-500)' : '1px solid rgba(255,255,255,0.05)',
                backgroundColor: plan.featured ? 'rgba(37, 99, 235, 0.05)' : 'var(--obsidian-black)'
              }}>
                {plan.featured && (
                  <div style={{ 
                    position: 'absolute', 
                    top: '-15px', 
                    left: '50%', 
                    transform: 'translateX(-50%)', 
                    backgroundColor: 'var(--blue-500)', 
                    color: 'white', 
                    padding: '4px 16px', 
                    borderRadius: '100px', 
                    fontSize: '0.75rem', 
                    fontWeight: '800',
                    textTransform: 'uppercase'
                  }}>
                    Most Popular
                  </div>
                )}
                <h3 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '0.5rem' }}>{plan.tier}</h3>
                <p style={{ color: 'var(--slate-400)', fontSize: '0.9rem', marginBottom: '2rem' }}>{plan.desc}</p>
                <div style={{ marginBottom: '2.5rem' }}>
                  <span style={{ fontSize: '3rem', fontWeight: '800' }}>{plan.price}</span>
                  {plan.price !== 'Custom' && <span style={{ color: 'var(--slate-500)' }}>/month</span>}
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2.5rem' }}>
                  {plan.features.map((feat, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.95rem' }}>
                      <Check size={18} color="var(--blue-500)" />
                      <span style={{ color: 'var(--slate-300)' }}>{feat}</span>
                    </div>
                  ))}
                </div>

                <Link to="/login" style={{ textDecoration: 'none' }}>
                  <Button variant={plan.featured ? 'primary' : 'outline'} style={{ 
                    width: '100%', 
                    borderRadius: '12px', 
                    padding: '1rem',
                    color: 'white',
                    borderColor: plan.featured ? 'transparent' : 'rgba(255,255,255,0.1)'
                  }}>
                    Choose {plan.tier}
                  </Button>
                </Link>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '8rem 5vw 4rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '4rem', 
          maxWidth: '1200px', 
          margin: '0 auto 6rem' 
        }}>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--blue-500)', display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <Car size={32} />
              <span>Valet<span style={{ color: 'var(--amber-gold)' }}>Pro</span></span>
            </div>
            <p style={{ color: 'var(--slate-500)', lineHeight: '1.6', maxWidth: '300px' }}>
              Transforming valet parking experience with cutting-edge digital tracking and management systems.
            </p>
          </div>
          {[
            { title: 'Platform', links: ['Features', 'Pipeline', 'Dashboard', 'Security'] },
            { title: 'Company', links: ['About', 'Careers', 'Contact', 'Blog'] },
            { title: 'Legal', links: ['Privacy Policy', 'Terms of Service', 'Cookie Policy'] },
          ].map((group, i) => (
            <div key={i}>
              <h4 style={{ fontWeight: '700', marginBottom: '1.5rem' }}>{group.title}</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {group.links.map(link => (
                  <a key={link} href="#" style={{ color: 'var(--slate-500)', textDecoration: 'none', fontSize: '0.9rem' }}>{link}</a>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div style={{ textAlign: 'center', marginTop: '2.5rem', padding: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <p style={{ color: 'var(--slate-400)', fontSize: '0.875rem', marginBottom: '1rem' }}>
            New to Valet Pro?
          </p>
          <Link to="/signup" style={{ textDecoration: 'none' }}>
            <Button variant="outline" style={{ 
              width: '100%', 
              borderRadius: '12px', 
              borderColor: 'rgba(255,255,255,0.1)', 
              color: 'white',
              backgroundColor: 'rgba(255,255,255,0.02)'
            }}>
              Register Your Venue
            </Button>
          </Link>
        </div>
        <div style={{ textAlign: 'center', color: 'var(--slate-600)', fontSize: '0.875rem' }}>
          © 2024 ValetPro Technologies. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
