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
    <Box
      component="section"
      sx={{
        position: 'relative',
        py: { xs: 12, md: 16 },
        overflow: 'hidden',
      }}
    >
      {/* UnicornStudio Background */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          overflow: 'hidden',
        }}
      >
        <Box
          data-us-project="TvsX3gOpieWTPMVGNpub"
          sx={{
            width: '100%',
            height: '100%',
            minWidth: '100%',
            minHeight: '100%',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to bottom, rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 1))',
          }}
        />
      </Box>

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 10, px: { xs: 3, sm: 6 } }}>
        <Box
          component={motion.div}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          sx={{ textAlign: 'center', mb: 8 }}
        >
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
              fontWeight: 700,
              mb: 2,
              color: '#ffffff',
            }}
          >
            Powerful Features for{' '}
            <Box
              component="span"
              sx={{
                background: 'linear-gradient(135deg, #603FEF 0%, #7D5FF3 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Modern Teams
            </Box>
          </Typography>
          <Typography
            variant="h6"
            sx={{
              fontSize: { xs: '1rem', md: '1.125rem' },
              color: 'rgba(255, 255, 255, 0.7)',
              maxWidth: '800px',
              mx: 'auto',
              lineHeight: 1.6,
            }}
          >
            Everything you need to turn data into actionable insights and drive business growth.
          </Typography>
        </Box>

        <Grid
          container
          spacing={3}
          component={motion.div}
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <Grid item xs={12} sm={6} lg={3} key={index}>
                <Card
                  component={motion.div}
                  variants={itemVariants}
                  sx={{
                    height: '100%',
                    backgroundColor: 'rgba(10, 10, 10, 0.6)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(96, 63, 239, 0.2)',
                    borderRadius: 2,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      backgroundColor: 'rgba(10, 10, 10, 0.8)',
                      borderColor: 'rgba(96, 63, 239, 0.5)',
                      transform: 'translateY(-4px)',
                      boxShadow: '0 12px 40px rgba(96, 63, 239, 0.2)',
                    },
                  }}
                >
                  <CardContent sx={{ p: 4 }}>
                    <Box
                      sx={{
                        width: 56,
                        height: 56,
                        borderRadius: 1.5,
                        backgroundColor: 'rgba(96, 63, 239, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mb: 3,
                        transition: 'background-color 0.3s ease',
                        '.MuiCard-root:hover &': {
                          backgroundColor: 'rgba(96, 63, 239, 0.2)',
                        },
                      }}
                    >
                      <IconComponent sx={{ fontSize: 28, color: '#603FEF' }} />
                    </Box>
                    <Typography
                      variant="h6"
                      sx={{
                        fontSize: '1.25rem',
                        fontWeight: 600,
                        mb: 1.5,
                        color: '#ffffff',
                      }}
                    >
                      {feature.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: 'rgba(255, 255, 255, 0.7)',
                        lineHeight: 1.6,
                      }}
                    >
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Container>
    </Box>
  );
};

export default FeaturesSection;