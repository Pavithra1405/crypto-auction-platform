import React, { useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Particles from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';

const Home = () => {
  const particlesInit = useCallback(async (engine) => {
    await loadSlim(engine);
  }, []);

  const particlesConfig = useMemo(() => ({
    fullScreen: {
      enable: true,
      zIndex: 0,
    },
    background: {
      color: {
        value: 'transparent',
      },
    },
    fpsLimit: 60,
    particles: {
      number: {
        value: 90,
        density: {
          enable: true,
          area: 800,
        },
      },
      color: {
        value: '#0073ff',
      },
      shape: {
        type: 'circle',
      },
      opacity: {
        value: 0.6,
        random: true,
        animation: {
          enable: true,
          speed: 1,
          minimumValue: 0.1,
          sync: false,
        },
      },
      size: {
        value: 4,
        random: true,
        animation: {
          enable: true,
          speed: 2,
          minimumValue: 0.1,
          sync: false,
        },
      },
      links: {
        enable: true,
        distance: 160,
        color: '#3b82f6',
        opacity: 0.35,
        width: 1,
      },
      move: {
        enable: true,
        speed: 1,
        direction: 'none',
        random: false,
        straight: false,
        outModes: {
          default: 'out',
        },
      },
    },
    interactivity: {
      events: {
        onHover: {
          enable: true,
          mode: 'grab',
        },
        onClick: {
          enable: true,
          mode: 'push',
        },
        resize: true,
      },
      modes: {
        grab: {
          distance: 140,
          links: {
            opacity: 0.5,
          },
        },
        push: {
          quantity: 4,
        },
      },
    },
    detectRetina: true,
  }), []);
  const features = [
    {
      icon: '🔒',
      title: 'Blockchain Security',
      description: 'All transactions and bids are recorded on our simulated blockchain for transparency',
    },
    {
      icon: '⚡',
      title: 'Real-time Bidding',
      description: 'Place bids instantly and see live updates as auctions progress',
    },
    {
      icon: '💎',
      title: 'Crypto Auctions',
      description: 'Buy and sell cryptocurrency in a secure, transparent auction environment',
    },
    {
      icon: '📊',
      title: 'Analytics Dashboard',
      description: 'Track your bidding history and auction performance with detailed insights',
    },
  ];

  const stats = [
    { label: 'Active Auctions', value: '127' },
    { label: 'Total Bids', value: '1,584' },
    { label: 'Total Users', value: '3,429' },
    { label: 'Success Rate', value: '98%' },
  ];

  return (
    <div className="relative overflow-hidden">
      {/* Particles Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Particles
          id="tsparticles"
          init={particlesInit}
          options={particlesConfig}
          className="w-full h-full"
          style={{ width: '100%', height: '100%' }}
        />
      </div>

      {/* Hero Section */}
      <section className="section-container py-20 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="gradient-text">Decentralized Crypto</span>
              <br />
              Auction Platform
            </h1>
            <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
              Buy and sell cryptocurrency in secure, transparent auctions powered by 
              blockchain technology. Join thousands of traders today.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link to="/auth/register" className="btn btn-primary text-lg px-8 py-4">
                Get Started
              </Link>
              <Link to="/live-prices" className="btn btn-secondary text-lg px-8 py-4">
                Live Prices
              </Link>
              <Link to="/blockchain" className="btn btn-secondary text-lg px-8 py-4">
                View Blockchain
              </Link>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20"
          >
            {stats.map((stat, index) => (
              <div key={index} className="card text-center">
                <div className="text-3xl font-bold gradient-text mb-2">
                  {String(stat.value)}
                </div>
                <div className="text-sm text-gray-400">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section-container py-20 bg-background-secondary/50">
        <div className="text-center mb-16">
          <motion.h2
            data-aos="fade-up"
            className="text-4xl font-bold gradient-text mb-4"
          >
            Why Choose CryptoAuction?
          </motion.h2>
          <motion.p
            data-aos="fade-up"
            data-aos-delay="100"
            className="text-gray-400 text-lg"
          >
            Built with cutting-edge technology for the modern crypto trader
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              data-aos="fade-up"
              data-aos-delay={String(index * 100)}
              className="card card-hover text-center"
            >
              <div className="text-5xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-3 text-gray-200">
                {feature.title}
              </h3>
              <p className="text-gray-400 text-sm">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="section-container py-20 relative z-10">
        <div className="text-center mb-16">
          <motion.h2
            data-aos="fade-up"
            className="text-4xl font-bold gradient-text mb-4"
          >
            How It Works
          </motion.h2>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="space-y-12">
            {[
              {
                step: '01',
                title: 'Create Account',
                description: 'Register as a seller or bidder. Public and private keys are automatically generated.',
              },
              {
                step: '02',
                title: 'Create or Browse Auctions',
                description: 'Sellers create crypto auctions. Bidders browse and find opportunities.',
              },
              {
                step: '03',
                title: 'Place Bids',
                description: 'Bid on active auctions. Every bid is recorded on the blockchain.',
              },
              {
                step: '04',
                title: 'Win & Trade',
                description: 'Highest bidder wins. All transactions are transparent and secure.',
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                data-aos="fade-right"
                data-aos-delay={String(index * 100)}
                className="flex gap-6 items-start"
              >
                <div className="flex-shrink-0 w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center shadow-glow font-bold text-2xl">
                  {item.step}
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-semibold mb-2 text-gray-200">
                    {item.title}
                  </h3>
                  <p className="text-gray-400">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-container py-20 bg-gradient-primary rounded-3xl relative z-10">
        <div className="text-center max-w-2xl mx-auto">
          <motion.div data-aos="zoom-in">
            <h2 className="text-4xl font-bold mb-4 text-white">
              Ready to Start Trading?
            </h2>
            <p className="text-blue-100 text-lg mb-8">
              Join thousands of traders on the most secure crypto auction platform
            </p>
            <Link to="/auth/register" className="btn bg-white text-primary-600 hover:bg-gray-100 text-lg px-8 py-4">
              Create Free Account
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;
