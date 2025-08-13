/**
 * Custom IdealImage component with improved quality for sized images
 */

import React from 'react';
import ReactIdealImage from '@slorber/react-ideal-image';
import {translate} from '@docusaurus/Translate';

// Helper function to convert bytes to human readable size
function bytesToSize(bytes) {
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  if (bytes === 0) {
    return 'n/a';
  }
  const scale = Math.floor(Math.log(bytes) / Math.log(1024));
  if (scale === 0) {
    return `${bytes} ${sizes[scale]}`;
  }
  return `${(bytes / 1024 ** scale).toFixed(1)} ${sizes[scale]}`;
}

// Custom message handler
function getMessage(icon, state) {
  switch (icon) {
    case 'noicon':
    case 'loaded':
      return null;
    case 'loading':
      return translate({
        id: 'theme.IdealImageMessage.loading',
        message: 'Loading...',
        description: 'When the full-scale image is loading',
      });
    case 'load': {
      const {pickedSrc} = state;
      const {size} = pickedSrc;
      const sizeMessage = size ? ` (${bytesToSize(size)})` : '';
      return translate(
        {
          id: 'theme.IdealImageMessage.load',
          message: 'Click to load{sizeMessage}',
          description:
            'To prompt users to load the full image. sizeMessage is a parenthesized size figure.',
        },
        {sizeMessage},
      );
    }
    case 'offline':
      return translate({
        id: 'theme.IdealImageMessage.offline',
        message: 'Your browser is offline. Image not loaded',
        description: 'When the user is viewing an offline document',
      });
    case 'error': {
      const {loadInfo} = state;
      if (loadInfo === 404) {
        return translate({
          id: 'theme.IdealImageMessage.404error',
          message: '404. Image not found',
          description: 'When the image is not found',
        });
      }
      return translate({
        id: 'theme.IdealImageMessage.error',
        message: 'Error. Click to reload',
        description: 'When the image fails to load for unknown error',
      });
    }
    default:
      throw new Error(`Wrong icon: ${icon}`);
  }
}

export default function IdealImage(props) {
  const {img, size, ...propsRest} = props;

  // In dev env just use regular img with original file
  if (typeof img === 'string' || 'default' in img) {
    return (
      <img src={typeof img === 'string' ? img : img.default} {...propsRest} />
    );
  }

  // For sized images (sm, md), use a higher quality placeholder
  // to avoid the blurry initial display
  let betterPlaceholder = img.preSrc;
  
  if (size === 'sm' || size === 'md' || size === 'lg') {
    const availableImages = img.src.images || [];
    if (availableImages.length > 0) {
      // For smaller sizes, use 600px image as placeholder instead of LQIP
      // This provides much better initial quality
      const higherQualityImage = availableImages.find(image => image.width === 600) ||
                                 availableImages.find(image => image.width === 300) ||
                                 availableImages[availableImages.length - 1];
      
      if (higherQualityImage) {
        betterPlaceholder = higherQualityImage.path;
      }
    }
  }

  return (
    <ReactIdealImage
      {...propsRest}
      height={img.src.height ?? 100}
      width={img.src.width ?? 100}
      placeholder={{lqip: betterPlaceholder}}
      src={img.src.src}
      srcSet={img.src.images.map((image) => ({
        ...image,
        src: image.path,
      }))}
      getMessage={getMessage}
      // For sized images, load eagerly to show quality immediately
      threshold={size ? 0 : undefined}
    />
  );
}