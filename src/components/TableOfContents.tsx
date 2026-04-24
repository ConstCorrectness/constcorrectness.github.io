import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  Link
} from '@mui/material';

interface Heading {
  id: string;
  text: string;
  level: number;
}

const TableOfContents: React.FC<{ containerId: string }> = ({ containerId }) => {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    const container = document.getElementById(containerId);
    if (!container) return;

    const elements = Array.from(container.querySelectorAll('h1, h2, h3')) as HTMLElement[];
    const headingData = elements.map((el, index) => {
      if (!el.id) {
        el.id = `heading-${index}`;
      }
      return {
        id: el.id,
        text: el.innerText,
        level: parseInt(el.tagName.replace('H', ''), 10),
      };
    });
    
    setTimeout(() => {
      setHeadings(headingData);
    }, 0);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '0% 0% -80% 0%' }
    );

    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [containerId]);

  if (headings.length === 0) return null;

  return (
    <Box sx={{ position: 'sticky', top: 100, ml: 4, display: { xs: 'none', lg: 'block' }, width: 240 }}>
      <Typography variant="overline" sx={{ fontWeight: 'bold', color: 'text.secondary', mb: 1, display: 'block' }}>
        Table of Contents
      </Typography>
      <List dense sx={{ borderLeft: '1px solid', borderColor: 'divider', pl: 1 }}>
        {headings.map((heading) => (
          <ListItem 
            key={heading.id} 
            disablePadding 
            sx={{ mb: 0.5 }}
          >
            <Link 
              href={`#${heading.id}`} 
              underline="none"
              sx={{ 
                width: '100%',
                color: activeId === heading.id ? 'primary.main' : 'text.secondary',
                fontWeight: activeId === heading.id ? 600 : 400,
                fontSize: '0.875rem',
                pl: (heading.level - 1) * 1.5,
                transition: 'color 0.2s',
                '&:hover': { color: 'primary.main' }
              }}
            >
              {heading.text}
            </Link>
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default TableOfContents;
