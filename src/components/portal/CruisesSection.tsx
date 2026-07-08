"use client";
import { formatCurrency } from "@/lib/currency";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Ship, Clock, ArrowRight, Sparkles, Anchor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { usePortalNavigation } from "@/hooks/use-portal-navigation";
import type { NormalizedCruise } from "@/lib/catalog/public-hydration";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.15 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const cardColors = [
  "from-sky-500 to-blue-600",
  "from-amber-500 to-orange-500",
  "from-emerald-500 to-teal-600",
];

export default function CruisesSection() {
  const { navigate } = usePortalNavigation();
  const [cruises, setCruises] = useState<NormalizedCruise[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    async function loadCruises() {
      try {
        const res = await fetch("/api/public/cruises", {
          signal: controller.signal,
          cache: "no-store",
        });

        if (!res.ok) {
          throw new Error(`Failed to fetch cruises: ${res.status}`);
        }

        const json = await res.json();

        if (json.success && Array.isArray(json.data)) {
          setCruises(json.data);
        }
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          console.error("Error fetching home cruises:", err);
          setCruises([]);
        }
      } finally {
        setIsLoading(false);
      }
    }

    loadCruises();

    return () => controller.abort();
  }, []);

  const heroCruise = cruises.find((cruise) => cruise.featured) || cruises[0];
  const listCruises = cruises.slice(0, 3);

  if (isLoading) {
    return (
      <section className="bg-neutral-50/50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
          <Skeleton className="h-10 w-48 mx-auto" />
          <Skeleton className="h-12 w-96 mx-auto" />
          <Skeleton className="h-[300px] w-full rounded-2xl" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-[250px] w-full rounded-xl" />
            <Skeleton className="h-[250px] w-full rounded-xl" />
            <Skeleton className="h-[250px] w-full rounded-xl" />
          </div>
        </div>
      </section>
    );
  }

  // When there are no cruises, simply don't render the section.
  // The navigation header and other sections naturally guide the user.
  if (cruises.length === 0) return null;

  return (
    <section id="cruises" className="bg-white">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8 lg:py-28"
      >
        <motion.div variants={itemVariants} className="text-center">
          <Badge className="mb-4 rounded-full bg-sky-100 px-4 py-1.5 text-sky-700 border-sky-200 text-xs font-semibold uppercase tracking-wider">
            <Ship className="mr-1.5 size-3" />
            Navega el Caribe
          </Badge>
          <h2 className="text-3xl font-extrabold tracking-tight text-neutral-900 sm:text-4xl lg:text-5xl">
            Nuestros Cruceros
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-base text-neutral-500 sm:text-lg">
            Navega por el Caribe colombiano y vive una experiencia inolvidable.
          </p>
        </motion.div>

        {heroCruise && (
          <motion.div
            variants={itemVariants}
            className="mt-12 relative overflow-hidden rounded-2xl shadow-xl group cursor-pointer"
            onClick={() => navigate("portal-cruise-detail", heroCruise.slug)}
          >
            <div className="absolute inset-0 bg-neutral-900/10 group-hover:bg-neutral-900/0 transition-colors z-10" />
            <img
              src={
                heroCruise.images && heroCruise.images[0]
                  ? heroCruise.images[0]
                  : "/images/cruceros.png"
              }
              alt={heroCruise.name}
              className="w-full aspect-[21/9] object-cover sm:aspect-[3/1] transition-transform duration-500 group-hover:scale-103"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-10" />
            <div className="absolute inset-0 flex items-end p-6 sm:p-10 z-20">
              <div className="max-w-xl">
                <Badge className="mb-3 rounded-full bg-amber-500 px-3 py-1 text-white border-transparent text-xs font-semibold flex items-center gap-1 w-max">
                  <Sparkles className="size-3" />
                  Recomendado
                </Badge>
                <h3 className="text-2xl font-bold text-white sm:text-3xl">
                  {heroCruise.name}
                </h3>
                <p className="mt-2 text-sm text-white/90 sm:text-base">
                  Operado por:{" "}
                  <span className="font-semibold text-sky-300">
                    {heroCruise.operator}
                  </span>
                  {heroCruise.shipName ? (
                    <>
                      {" "}
                      · Barco:{" "}
                      <span className="font-semibold text-sky-300">
                        {heroCruise.shipName}
                      </span>
                    </>
                  ) : null}
                </p>
                <p className="mt-1 flex items-center gap-2 text-sm text-white/80">
                  <Clock className="size-4 text-amber-400" />
                  {heroCruise.durationDays} días / {heroCruise.durationDays - 1}{" "}
                  noches · Desde {formatCurrency(heroCruise.priceFrom)}
                </p>
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate("portal-cruise-detail", heroCruise.slug);
                  }}
                  className="mt-5 rounded-xl bg-amber-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-amber-500/30 transition-all hover:bg-amber-600 hover:shadow-xl"
                >
                  Ver Detalles
                  <ArrowRight className="ml-2 size-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {listCruises.map((cruise, idx) => (
            <motion.div
              key={cruise.id}
              variants={itemVariants}
              whileHover={{ y: -4 }}
              className="group cursor-pointer overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm transition-shadow hover:shadow-lg"
              onClick={() => navigate("portal-cruise-detail", cruise.slug)}
            >
              {cruise.images && cruise.images[0] ? (
                <div className="relative aspect-[16/10] overflow-hidden">
                  <img
                    src={cruise.images[0]}
                    alt={cruise.name}
                    className="w-full h-full object-cover transition-transform duration-350 group-hover:scale-105"
                  />
                  {cruise.featured && (
                    <Badge className="absolute top-3 right-3 rounded-full bg-amber-500 text-white px-2.5 py-0.5 text-xs font-semibold border-transparent">
                      <Sparkles className="mr-1 size-3 text-white" />
                      Destacado
                    </Badge>
                  )}
                </div>
              ) : (
                <div
                  className={`relative flex aspect-[16/10] items-center justify-center bg-gradient-to-br ${cardColors[idx % cardColors.length]}`}
                >
                  <Ship className="size-12 text-white/40" />
                  {cruise.featured && (
                    <Badge className="absolute top-3 right-3 rounded-full bg-white/90 px-2.5 py-0.5 text-xs font-semibold text-neutral-900 border-transparent">
                      <Sparkles className="mr-1 size-3 text-amber-500" />
                      Destacado
                    </Badge>
                  )}
                </div>
              )}

              <div className="p-5">
                <h4 className="text-lg font-bold text-neutral-900 group-hover:text-amber-600 transition-colors">
                  {cruise.name}
                </h4>
                <div className="mt-2 flex items-center gap-4">
                  <span className="flex items-center gap-1.5 text-sm text-neutral-500">
                    <Clock className="size-3.5" />
                    {cruise.durationDays} días
                  </span>
                  <span className="rounded-full bg-sky-50 px-2.5 py-0.5 text-xs font-medium text-sky-700 border border-sky-100 flex items-center gap-1">
                    <Anchor className="size-3" />
                    {cruise.operator}
                  </span>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-sm text-neutral-500">Desde</p>
                  <p className="text-xl font-extrabold text-sky-800">
                    {formatCurrency(cruise.priceFrom)}
                  </p>
                </div>
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate("portal-cruise-detail", cruise.slug);
                  }}
                  className="mt-4 w-full rounded-xl bg-amber-500 py-2.5 text-sm font-semibold text-white transition-all hover:bg-amber-600"
                >
                  Reservar
                </Button>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div variants={itemVariants} className="mt-10 text-center">
          <button
            onClick={() => navigate("portal-cruises")}
            className="inline-flex items-center gap-2 text-sm font-semibold text-amber-600 transition-colors hover:text-amber-700"
          >
            Ver todos los cruceros
            <ArrowRight className="size-4" />
          </button>
        </motion.div>
      </motion.div>
    </section>
  );
}
