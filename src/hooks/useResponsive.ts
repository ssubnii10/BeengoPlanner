import { useState, useEffect } from 'react';
import { Dimensions } from 'react-native';

export type BreakPoint = 'mobile' | 'tablet' | 'desktop';

export function useResponsive() {
  const [dims, setDims] = useState(Dimensions.get('window'));

  useEffect(() => {
    const sub = Dimensions.addEventListener('change', ({ window }) => {
      setDims(window);
    });
    return () => sub.remove();
  }, []);

  const bp: BreakPoint =
    dims.width >= 1024 ? 'desktop' :
    dims.width >= 768  ? 'tablet'  : 'mobile';

  return {
    width:     dims.width,
    height:    dims.height,
    bp,
    isMobile:  bp === 'mobile',
    isTablet:  bp === 'tablet',
    isDesktop: bp === 'desktop',
    // 콘텐츠 최대 너비
    contentWidth:
      bp === 'desktop' ? 480 :
      bp === 'tablet'  ? 600 : dims.width,
  };
}