'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser, User } from '@/lib/auth';

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
    
    if (currentUser) {
      // Redirect to role-specific page
      const userRole = currentUser.role;
      if (userRole === 'admin') {
        router.push('/admin');
      } else {
        router.push(`/${userRole}`);
      }
    } else {
      setLoading(false);
    }
  }, [router]);

  // Show loading state while checking user
  if (loading && user) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: 'var(--bg)' }}>
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 rounded-full animate-spin" style={{ borderColor: 'var(--border)', borderTopColor: 'var(--primary)' }}></div>
          </div>
          <div className="text-lg font-medium" style={{ color: 'var(--text)' }}>Redirecting...</div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Hero Section - starts right below navbar */}
      <section className="hero-section" style={{
        padding: 'calc(130px) 18px 34px',
        position: 'relative',
        backgroundImage: 'url(/images.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center center',
        backgroundRepeat: 'no-repeat',
        borderBottom: '1px solid var(--border)',
        textAlign: 'center',
        minHeight: '580px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 'calc(100vw)',
        margin: '',
        left: 0,
        right: 0
      }}>
          {/* Overlay for better text readability */}
          <div style={{
            position: 'absolute',
            inset: 0,
            //background: 'linear-gradient(135deg, rgba(233,75,106,.4), rgba(247,200,115,.3))',
            zIndex: 1
          }}></div>
          <div className="container" style={{ maxWidth: 'var(--max)', margin: '0 auto', padding: '0 18px', position: 'relative', zIndex: 2 }}>
            <h1 style={{
              margin: 0,
              fontSize: 'clamp(28px, 3.2vw, 44px)',
              letterSpacing: '-.02em',
              fontWeight: 900,
              color: '#fff',
              textShadow: '2px 2px 8px rgba(0,0,0,0.5)'
            }}>
              Welcome to MyMatrimony
            </h1>
            <p style={{
              margin: '10px auto 0',
              color: 'rgba(255,255,255,0.95)',
              maxWidth: '65ch',
              fontSize: '15.5px',
              textShadow: '1px 1px 4px rgba(0,0,0,0.5)'
            }}>
              Discover verified profiles, smart search filters, and a family-friendly matchmaking experience.
            </p>
            <div className="hero-actions" style={{
              marginTop: '18px',
              display: 'flex',
              justifyContent: 'center',
              gap: '12px',
              flexWrap: 'wrap'
            }}>
              <Link
                href="/register"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '12px 18px',
                  borderRadius: '999px',
                  fontWeight: 700,
                  border: '1px solid transparent',
                  cursor: 'pointer',
                  transition: '0.15s',
                  background: 'linear-gradient(135deg, var(--primary), var(--primary-2))',
                  color: '#fff',
                  boxShadow: '0 12px 22px rgba(233,75,106,.22)',
                  fontSize: '14px',
                  textDecoration: 'none'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                Get Started
              </Link>
            </div>
          </div>
        </section>

      {/* Main Page Card */}
      <div className="container" style={{ maxWidth: 'var(--max)', margin: '18px auto 40px', padding: '0 18px' }}>
          <div className="page-card" style={{
            border: '1px solid var(--border)',
            borderRadius: '22px',
            background: 'rgba(255,255,255,.65)',
            boxShadow: '0 20px 60px rgba(0,0,0,.06)',
            overflow: 'hidden'
          }}>
            {/* Features Section */}
            <section className="section" id="features" style={{ padding: '28px 18px' }}>
              <div className="section-title" style={{ textAlign: 'center', margin: '0 0 18px' }}>
                <h2 style={{ margin: 0, fontSize: '22px', letterSpacing: '-.01em', fontWeight: 900, color: 'var(--text)' }}>
                  Key Features
                </h2>
                <p style={{ margin: '8px 0 0', color: 'var(--muted)', fontSize: '14px' }}>
                  Simple, safe and designed for quick matchmaking.
                </p>
              </div>

              <div className="grid-3" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '16px'
              }}>
                <div className="card" style={{
                  background: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: '18px',
                  boxShadow: 'var(--shadow)',
                  padding: '18px',
                  textAlign: 'center'
                }}>
                  <div className="icon" style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '999px',
                    margin: '0 auto 10px',
                    display: 'grid',
                    placeItems: 'center',
                    background: 'linear-gradient(135deg, rgba(233,75,106,.16), rgba(247,200,115,.20))',
                    border: '1px solid rgba(233,75,106,.16)',
                    color: 'var(--primary)',
                    fontWeight: 900,
                    fontSize: '18px'
                  }}>
                    ❤
                  </div>
                  <h3 style={{ margin: '6px 0 6px', fontSize: '16px', fontWeight: 700, color: 'var(--text)' }}>
                    Verified Profiles
                  </h3>
                  <p style={{ margin: 0, color: 'var(--muted)', fontSize: '13.5px', lineHeight: 1.45 }}>
                    Phone/ID verification options to build trust and reduce fake accounts.
                  </p>
                </div>

                <div className="card" style={{
                  background: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: '18px',
                  boxShadow: 'var(--shadow)',
                  padding: '18px',
                  textAlign: 'center'
                }}>
                  <div className="icon" style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '999px',
                    margin: '0 auto 10px',
                    display: 'grid',
                    placeItems: 'center',
                    background: 'linear-gradient(135deg, rgba(233,75,106,.16), rgba(247,200,115,.20))',
                    border: '1px solid rgba(233,75,106,.16)',
                    color: 'var(--primary)',
                    fontWeight: 900,
                    fontSize: '18px'
                  }}>
                    ⚙
                  </div>
                  <h3 style={{ margin: '6px 0 6px', fontSize: '16px', fontWeight: 700, color: 'var(--text)' }}>
                    Smart Filters
                  </h3>
                  <p style={{ margin: 0, color: 'var(--muted)', fontSize: '13.5px', lineHeight: 1.45 }}>
                    Search by community, age, location, education, profession and more.
                  </p>
                </div>

                <div className="card" style={{
                  background: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: '18px',
                  boxShadow: 'var(--shadow)',
                  padding: '18px',
                  textAlign: 'center'
                }}>
                  <div className="icon" style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '999px',
                    margin: '0 auto 10px',
                    display: 'grid',
                    placeItems: 'center',
                    background: 'linear-gradient(135deg, rgba(233,75,106,.16), rgba(247,200,115,.20))',
                    border: '1px solid rgba(233,75,106,.16)',
                    color: 'var(--primary)',
                    fontWeight: 900,
                    fontSize: '18px'
                  }}>
                    🚀
                  </div>
                  <h3 style={{ margin: '6px 0 6px', fontSize: '16px', fontWeight: 700, color: 'var(--text)' }}>
                    Assisted Matchmaking
                  </h3>
                  <p style={{ margin: 0, color: 'var(--muted)', fontSize: '13.5px', lineHeight: 1.45 }}>
                    Optional relationship manager support for families who want guidance.
                  </p>
                </div>
              </div>
            </section>

            {/* Process Section */}
            <section className="section" id="process" style={{ padding: '10px 18px 28px' }}>
              <div className="section-title" style={{ textAlign: 'center', margin: '0 0 18px' }}>
                <h2 style={{ margin: 0, fontSize: '22px', letterSpacing: '-.01em', fontWeight: 900, color: 'var(--text)' }}>
                  Our Process
                </h2>
                <p style={{ margin: '8px 0 0', color: 'var(--muted)', fontSize: '14px' }}>
                  Clear steps that users understand instantly.
                </p>
              </div>

              <div className="process" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '16px',
                alignItems: 'stretch'
              }}>
                <div className="step" style={{
                  background: 'rgba(255,255,255,.75)',
                  border: '1px solid var(--border)',
                  borderRadius: '18px',
                  padding: '16px',
                  display: 'flex',
                  gap: '12px',
                  alignItems: 'flex-start'
                }}>
                  <div className="step-ic" style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '999px',
                    background: 'rgba(233,75,106,.10)',
                    border: '1px solid rgba(233,75,106,.18)',
                    display: 'grid',
                    placeItems: 'center',
                    color: 'var(--primary)',
                    fontWeight: 900,
                    flex: '0 0 auto',
                    fontSize: '18px'
                  }}>
                    🔎
                  </div>
                  <div>
                    <b style={{ display: 'block', marginTop: '2px', fontWeight: 700, color: 'var(--text)' }}>Research</b>
                    <span style={{ display: 'block', color: 'var(--muted)', fontSize: '13.5px', marginTop: '4px', lineHeight: 1.45 }}>
                      Set preferences and shortlist profiles that match your expectations.
                    </span>
                  </div>
                </div>

                <div className="step" style={{
                  background: 'rgba(255,255,255,.75)',
                  border: '1px solid var(--border)',
                  borderRadius: '18px',
                  padding: '16px',
                  display: 'flex',
                  gap: '12px',
                  alignItems: 'flex-start'
                }}>
                  <div className="step-ic" style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '999px',
                    background: 'rgba(233,75,106,.10)',
                    border: '1px solid rgba(233,75,106,.18)',
                    display: 'grid',
                    placeItems: 'center',
                    color: 'var(--primary)',
                    fontWeight: 900,
                    flex: '0 0 auto',
                    fontSize: '18px'
                  }}>
                    👥
                  </div>
                  <div>
                    <b style={{ display: 'block', marginTop: '2px', fontWeight: 700, color: 'var(--text)' }}>Connect</b>
                    <span style={{ display: 'block', color: 'var(--muted)', fontSize: '13.5px', marginTop: '4px', lineHeight: 1.45 }}>
                      Chat safely, request contact, and involve families when ready.
                    </span>
                  </div>
                </div>

                <div className="step" style={{
                  background: 'rgba(255,255,255,.75)',
                  border: '1px solid var(--border)',
                  borderRadius: '18px',
                  padding: '16px',
                  display: 'flex',
                  gap: '12px',
                  alignItems: 'flex-start'
                }}>
                  <div className="step-ic" style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '999px',
                    background: 'rgba(233,75,106,.10)',
                    border: '1px solid rgba(233,75,106,.18)',
                    display: 'grid',
                    placeItems: 'center',
                    color: 'var(--primary)',
                    fontWeight: 900,
                    flex: '0 0 auto',
                    fontSize: '18px'
                  }}>
                    ✨
                  </div>
                  <div>
                    <b style={{ display: 'block', marginTop: '2px', fontWeight: 700, color: 'var(--text)' }}>Finalize</b>
                    <span style={{ display: 'block', color: 'var(--muted)', fontSize: '13.5px', marginTop: '4px', lineHeight: 1.45 }}>
                      Meet, verify details, and proceed confidently to marriage.
                    </span>
                  </div>
                </div>
              </div>
            </section>

          </div>
        </div>


      <style jsx>{`
        @media (max-width: 960px) {
          .menu {
            display: none;
          }
        }
        @media (max-width: 900px) {
          .grid-3 {
            grid-template-columns: 1fr !important;
          }
          .process {
            grid-template-columns: 1fr !important;
          }
          .team {
            grid-template-columns: 1fr !important;
          }
          .hero-section {
            padding: calc(130px) 18px 34px !important;
            width: 100vw !important;
            margin: 82px 0 0 !important;
            left: 0 !important;
            right: 0 !important;
          }
        }
      `}</style>
    </>
  );
}
