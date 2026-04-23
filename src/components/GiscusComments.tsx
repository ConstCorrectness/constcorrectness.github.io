import React from 'react';
import Giscus from '@giscus/react';
import { Box, useTheme } from '@mui/material';

const GiscusComments: React.FC = () => {
  const theme = useTheme();

  return (
    <Box sx={{ mt: 10, pt: 6, borderTop: '1px solid', borderColor: 'divider' }}>
      <Giscus
        id="comments"
        repo="constcorrectness/constcorrectness.github.io"
        repoId="R_kgDON7uI7A" // You'll need to update this with your actual repoId
        category="Announcements"
        categoryId="DIC_kwDON7uI7M4CnR-R" // You'll need to update this with your actual categoryId
        mapping="pathname"
        term="Welcome to my blog!"
        reactionsEnabled="1"
        emitMetadata="0"
        inputPosition="top"
        theme={theme.palette.mode}
        lang="en"
        loading="lazy"
      />
    </Box>
  );
};

export default GiscusComments;
