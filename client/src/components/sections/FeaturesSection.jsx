import { motion } from 'framer-motion';
import { useEffect, useRef } from 'react';
import { Box, Container, Typography, Grid, Card, CardContent } from '@mui/material';
import {
  Psychology,
  BarChart,
  Security,
  Bolt,
} from '@mui/icons-material';

const features = [
  {
    icon: Psychology,
    title: 'AI-Powered Insights',
    description: 'Advanced machine learning algorithms analyze your data to uncover hidden patterns and opportunities.',
  },
  {
    icon: BarChart,
    title: 'Real-Time Analytics',
    description: 'Monitor your metrics in real-time with beautiful visualizations that update instantly.',
  },
  {
    icon: Bolt,
    title: 'Lightning Fast',
    description: 'Process millions of data points in milliseconds with our optimized infrastructure.',
  },
  {
    icon: Security,
    title: 'Enterprise Security',
    description: 'Bank-level encryption and compliance certifications keep your data safe and secure.',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
};

const FeaturesSection = () => {
  const scriptLoaded = useRef(false);

  useEffect(() => {
    if (scriptLoaded.current) return;

    if (!window.UnicornStudio) {
      window.UnicornStudio = { isInitialized: false, init: () => {}, destroy: () => {} };
      
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js@v1.5.3/dist/unicornStudio.umd.js';
      script.onload = () => {
        if (window.UnicornStudio && !window.UnicornStudio.isInitialized) {
          window.UnicornStudio.init();
          window.UnicornStudio.isInitialized = true;
        }
      };
      document.head.appendChild(script);
    } else if (!window.UnicornStudio.isInitialized) {
      window.UnicornStudio.init();
      window.UnicornStudio.isInitialized = true;
    }

    scriptLoaded.current = true;
  }, []);

  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      {/* UnicornStudio Background */}
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        <div 
          data-us-project="TvsX3gOpieWTPMVGNpub" 
          className="w-full h-full"
          style={{ minWidth: '100%', minHeight: '100%' }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="section-title mb-4">
            Powerful Features for{' '}
            <span className="gradient-text">Modern Teams</span>
          </h2>
          <p className="section-subtitle mx-auto">
            Everything you need to turn data into actionable insights and drive business growth.
          </p>
        </motion.div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="glass-card-hover p-8 group"
            >
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors duration-300">
                <feature.icon className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-foreground">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesSection;