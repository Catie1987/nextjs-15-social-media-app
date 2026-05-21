"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/custom-dialog";
import { cn } from "@/lib/utils";
import { Media } from "@prisma/client";
import useEmblaCarousel from "embla-carousel-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

interface MediaModalProps {
  media: Media;
  allMedia: Media[];
}

export default function MediaModal({ media, allMedia }: MediaModalProps) {
  const router = useRouter();
  const [open, setOpen] = useState(true);
  const startIndex = allMedia.findIndex((m) => m.id === media.id);

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    startIndex: startIndex >= 0 ? startIndex : 0,
  });

  const [selectedIndex, setSelectedIndex] = useState(
    startIndex >= 0 ? startIndex : 0,
  );

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", onSelect);
    onSelect();
  }, [emblaApi, onSelect]);

  function handleOpenChange(open: boolean) {
    setOpen(open);
    if (!open) router.back();
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="h-dvh w-screen border-none">
        <DialogHeader>
          <DialogTitle />
        </DialogHeader>

        {/* Carousel */}
        <div className="flex h-full items-center justify-center px-4 pb-8">
          <div className="relative w-full max-w-3xl">
            <div className="overflow-hidden rounded-2xl" ref={emblaRef}>
              <div className="flex touch-pan-y">
                {allMedia.map((m) => (
                  <div
                    key={m.id}
                    className="flex min-w-0 flex-[0_0_100%] items-center justify-center"
                  >
                    {m.type === "IMAGE" ? (
                      <Image
                        src={m.url}
                        alt="Media"
                        width={1200}
                        height={900}
                        className="max-h-[85vh] w-auto rounded-2xl object-contain"
                      />
                    ) : (
                      <video
                        src={m.url}
                        controls
                        autoPlay
                        className="max-h-[85vh] w-full rounded-2xl"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Counter + dots for multiple media */}
            {allMedia.length > 1 && (
              <>
                <div className="absolute right-2 top-2 rounded-full bg-black/50 px-2 py-0.5 text-xs font-medium text-white">
                  {selectedIndex + 1}/{allMedia.length}
                </div>
                <div className="mt-3 flex justify-center gap-1.5">
                  {allMedia.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => emblaApi?.scrollTo(i)}
                      className={cn(
                        "size-1.5 rounded-full transition-all duration-300",
                        i === selectedIndex ? "w-3 bg-white" : "bg-white/30",
                      )}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}