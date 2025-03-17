import React, {
  type ReactNode,
  useCallback,
  useRef,
  useState,
  useEffect,
} from "react";
import ReactIdealImage, {
  type IconKey,
  type State,
} from "@slorber/react-ideal-image";
import { translate } from "@docusaurus/Translate";
import { Controlled as ControlledZoom } from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";
import styles from "./styles.module.css";

import type { Props, SrcType } from "@theme/IdealImage";

// Adopted from https://github.com/endiliey/react-ideal-image/blob/master/src/components/helpers.js#L59-L65
function bytesToSize(bytes: number) {
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  if (bytes === 0) {
    return "n/a";
  }
  const scale = Math.floor(Math.log(bytes) / Math.log(1024));
  if (scale === 0) {
    return `${bytes} ${sizes[scale]!}`;
  }
  return `${(bytes / 1024 ** scale).toFixed(1)} ${sizes[scale]!}`;
}

// Define the available sizes
const MAX_SIZE_FILTERS = {
  xs: 128,
  sm: 300,
  md: 600,
  lg: 1024,
} as const;

// Utility function to filter `srcSet` based on the `size`
const filterSrcSet = (
  srcSet: SrcType[],
  size: keyof typeof MAX_SIZE_FILTERS,
) => {
  const max_size = MAX_SIZE_FILTERS[size] || MAX_SIZE_FILTERS["lg"];
  return srcSet.filter((image) => image.width <= max_size);
};

// Adopted from https://github.com/endiliey/react-ideal-image/blob/master/src/components/IdealImage/index.js#L43-L75
function getMessage(icon: IconKey, state: State) {
  switch (icon) {
    case "noicon":
    case "loaded":
      return null;
    case "loading":
      return translate({
        id: "theme.IdealImageMessage.loading",
        message: "Loading...",
        description: "When the full-scale image is loading",
      });
    case "load": {
      // We can show `alt` here
      const { pickedSrc } = state;
      const { size } = pickedSrc;
      const sizeMessage = size ? ` (${bytesToSize(size)})` : "";
      return translate(
        {
          id: "theme.IdealImageMessage.load",
          message: "Click to load{sizeMessage}",
          description:
            "To prompt users to load the full image. sizeMessage is a parenthesized size figure.",
        },
        { sizeMessage },
      );
    }
    case "offline":
      return translate({
        id: "theme.IdealImageMessage.offline",
        message: "Your browser is offline. Image not loaded",
        description: "When the user is viewing an offline document",
      });
    case "error": {
      const { loadInfo } = state;
      if (loadInfo === 404) {
        return translate({
          id: "theme.IdealImageMessage.404error",
          message: "404. Image not found",
          description: "When the image is not found",
        });
      }
      return translate({
        id: "theme.IdealImageMessage.error",
        message: "Error. Click to reload",
        description: "When the image fails to load for unknown error",
      });
    }
    default:
      throw new Error(`Wrong icon: ${icon}`);
  }
}

export default function IdealImage(
  props: Props & {
    size: keyof typeof MAX_SIZE_FILTERS;
    alt: string;
    background?: "white" | "black";
    border?: boolean;
  },
): ReactNode {
  const { img, size, alt, background, border, ...propsRest } = props;

  // In dev env just use regular img with original file
  if (typeof img === "string" || "default" in img) {
    return (
      // eslint-disable-next-line jsx-a11y/alt-text
      <img src={typeof img === "string" ? img : img.default} {...propsRest} />
    );
  }

  // Filter images based on selected size
  const filteredSet = filterSrcSet(img.src.images, size);
  const currentImage =
    filteredSet.length > 0
      ? filteredSet[filteredSet.length - 1]
      : img.src.images[img.src.images.length - 1];
  const highestResSrc = img.src.images[img.src.images.length - 1];

  const [isZoomed, setIsZoomed] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const imageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!imageRef.current) return;

    const observer = new MutationObserver(() => {
      const imgElement = imageRef.current?.querySelector("img");
      if (imgElement && imgElement.complete) {
        setIsLoaded(true);
        observer.disconnect();
      }
    });

    observer.observe(imageRef.current, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, []);

  const handleZoomChange = useCallback((shouldZoom: boolean) => {
    setIsZoomed(shouldZoom);
  }, []);

  // Apply conditional styles based on the `size`
  const imageStyles: React.CSSProperties =
    size === "lg"
      ? {
          width: "100%",
          height: "auto",
          maxWidth: "100%",
          marginBottom: "-4px",
          boxShadow: border
            ? "0px 1px 8px -1px rgba(21, 21, 21, 0.20)"
            : "none",
        }
      : {
          width: `${MAX_SIZE_FILTERS[size]}px`,
          margin: "0 auto",
          display: "block",
          boxShadow: border
            ? "0px 1px 8px -1px rgba(21, 21, 21, 0.20)"
            : "none",
        };

  const containerStyles: React.CSSProperties = {
    position: "relative",
    ...(background ? { backgroundColor: background } : {}),
    marginBottom: "16px",
  };

  return (
    <div style={containerStyles}>
      {/* Zoomed Image */}
      <ControlledZoom
        isZoomed={isZoomed}
        onZoomChange={handleZoomChange}
        classDialog={`${styles.customZoom} ${background == "white" ? styles.customWhiteZoom : ""}`}
      >
        {isLoaded && (
          <img
            src={highestResSrc.path}
            alt={`${alt} - Zoomed`}
            loading="lazy"
            width={highestResSrc.width}
            style={{
              position: "absolute",
              visibility: isZoomed ? "visible" : "hidden",
            }}
          />
        )}
      </ControlledZoom>

      {/* Clickable IdealImage (Hidden when zoomed) */}
      <div
        ref={imageRef}
        onClick={() => isLoaded && setIsZoomed(true)}
        style={{
          cursor: isLoaded ? "zoom-in" : "default",
          visibility: isZoomed ? "hidden" : "visible",
        }}
      >
        <ReactIdealImage
          {...propsRest}
          height={currentImage.height ?? 100}
          alt={alt}
          width={currentImage.width ?? 100}
          placeholder={{ lqip: img.preSrc }}
          src={currentImage.path}
          srcSet={filteredSet.map((image) => ({
            ...image,
            src: image.path,
          }))}
          style={imageStyles}
        />
      </div>
    </div>
  );
}
