"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "motion/react";
import {
  fadeUp,
  staggerContainer,
  scaleIn,
  slideInFromRight,
} from "@/lib/motion/variants";

// shadcn UI Base Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

// Vengeance UI Premium Components
import { Marquee } from "@/components/premium/marquee";
import { HeroGlow } from "@/components/premium/hero-glow";
import { SpotlightCard } from "@/components/premium/spotlight-card";

// Icons
import {
  Car,
  ShieldCheck,
  Zap,
  RotateCw,
  Sparkles,
  SlidersHorizontal,
  ChevronRight,
  Layers,
  Palette,
  CheckCircle2,
} from "lucide-react";

const testFormSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  carBudget: z.string().min(1, "Please select your budget range"),
});

type TestFormValues = z.infer<typeof testFormSchema>;

export default function StyleGuidePage() {
  const [sliderVal, setSliderVal] = useState([45]);
  const [motionKey, setMotionKey] = useState(0);
  const [formSubmitted, setFormSubmitted] = useState<string | null>(null);

  const form = useForm<TestFormValues>({
    resolver: zodResolver(testFormSchema),
    defaultValues: {
      fullName: "",
      email: "",
      carBudget: "",
    },
  });

  const onSubmit = (data: TestFormValues) => {
    setFormSubmitted(JSON.stringify(data, null, 2));
  };

  return (
    <div className="min-h-screen bg-background pb-24 text-foreground">
      {/* Top Banner / Hero Glow Section */}
      <HeroGlow className="border-b border-border">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary">
              <Sparkles className="size-3.5" />
              <span>Phase 1 — Design System & Shared Animation Primitives</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              Bhopal Car Deal <span className="text-primary">Style Guide</span>
            </h1>
            <p className="max-w-2xl text-muted-foreground sm:text-lg">
              Visual verification sandbox for design tokens, shadcn/ui base components,
              Vengeance UI modules, and hardware-accelerated motion primitives.
            </p>
          </div>
        </div>
      </HeroGlow>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 mt-12 space-y-16">
        {/* SECTION 1: DESIGN TOKENS (COLORS & TYPOGRAPHY) */}
        <section className="space-y-6">
          <div className="flex items-center gap-3 border-b border-border pb-3">
            <Palette className="size-6 text-primary" />
            <div>
              <h2 className="text-2xl font-bold tracking-tight">1. Design Tokens</h2>
              <p className="text-sm text-muted-foreground">
                Palette definition: Racing Crimson accent + neutral slate backgrounds.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6">
            <div className="space-y-2 rounded-xl border border-border p-3">
              <div className="h-14 rounded-lg bg-primary shadow-xs" />
              <div className="text-xs">
                <p className="font-semibold">Primary Accent</p>
                <p className="text-muted-foreground">hsl(350 89% 55%)</p>
              </div>
            </div>
            <div className="space-y-2 rounded-xl border border-border p-3">
              <div className="h-14 rounded-lg bg-background border border-border shadow-xs" />
              <div className="text-xs">
                <p className="font-semibold">Background</p>
                <p className="text-muted-foreground">var(--background)</p>
              </div>
            </div>
            <div className="space-y-2 rounded-xl border border-border p-3">
              <div className="h-14 rounded-lg bg-card border border-border shadow-xs" />
              <div className="text-xs">
                <p className="font-semibold">Card Surface</p>
                <p className="text-muted-foreground">var(--card)</p>
              </div>
            </div>
            <div className="space-y-2 rounded-xl border border-border p-3">
              <div className="h-14 rounded-lg bg-secondary shadow-xs" />
              <div className="text-xs">
                <p className="font-semibold">Secondary</p>
                <p className="text-muted-foreground">var(--secondary)</p>
              </div>
            </div>
            <div className="space-y-2 rounded-xl border border-border p-3">
              <div className="h-14 rounded-lg bg-muted shadow-xs" />
              <div className="text-xs">
                <p className="font-semibold">Muted</p>
                <p className="text-muted-foreground">var(--muted)</p>
              </div>
            </div>
            <div className="space-y-2 rounded-xl border border-border p-3">
              <div className="h-14 rounded-lg bg-destructive shadow-xs" />
              <div className="text-xs">
                <p className="font-semibold">Destructive</p>
                <p className="text-muted-foreground">var(--destructive)</p>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2: SHADCN/UI BASE COMPONENTS */}
        <section className="space-y-8">
          <div className="flex items-center gap-3 border-b border-border pb-3">
            <Layers className="size-6 text-primary" />
            <div>
              <h2 className="text-2xl font-bold tracking-tight">2. shadcn/ui Base Components</h2>
              <p className="text-sm text-muted-foreground">
                All 13 required base primitives configured with Radix UI & strict typing.
              </p>
            </div>
          </div>

          {/* Sub-block: Buttons & Badges */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Buttons (Variants & Sizes)</CardTitle>
                <CardDescription>Accessible interactive buttons</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Button variant="default">Primary Default</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="destructive">Destructive</Button>
                  <Button variant="link">Link</Button>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Button size="sm">Small</Button>
                  <Button size="default">Default</Button>
                  <Button size="lg">Large CTA</Button>
                  <Button size="icon" variant="outline" aria-label="Car Icon">
                    <Car className="size-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Badges</CardTitle>
                <CardDescription>Status indicators and car highlight tags</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2.5">
                <Badge variant="default">Verified</Badge>
                <Badge variant="featured">Featured Stock</Badge>
                <Badge variant="success">RC Transfer Included</Badge>
                <Badge variant="secondary">Single Owner</Badge>
                <Badge variant="outline">Manual Transmission</Badge>
                <Badge variant="destructive">Sold Out</Badge>
              </CardContent>
            </Card>
          </div>

          {/* Sub-block: Inputs, Select, Slider */}
          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Input Field</CardTitle>
                <CardDescription>Search & lead text fields</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Input placeholder="Search cars by make or model..." />
                <Input type="email" placeholder="john@example.com" />
                <Input disabled placeholder="Disabled field" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Select Dropdown</CardTitle>
                <CardDescription>Brand & filter selection</CardDescription>
              </CardHeader>
              <CardContent>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Brand" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>German Luxury</SelectLabel>
                      <SelectItem value="bmw">BMW</SelectItem>
                      <SelectItem value="mercedes">Mercedes-Benz</SelectItem>
                      <SelectItem value="audi">Audi</SelectItem>
                    </SelectGroup>
                    <SelectGroup>
                      <SelectLabel>Premium Mass</SelectLabel>
                      <SelectItem value="vw">Volkswagen</SelectItem>
                      <SelectItem value="skoda">Škoda</SelectItem>
                      <SelectItem value="toyota">Toyota</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Slider (EMI / Price Filter)</CardTitle>
                <CardDescription>Current: ₹{sliderVal[0]} Lakhs</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-2">
                <Slider
                  value={sliderVal}
                  onValueChange={setSliderVal}
                  max={100}
                  step={1}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>₹0 L</span>
                  <span>₹50 L</span>
                  <span>₹100 L</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sub-block: Dialog & Sheet */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Dialog Modal</CardTitle>
                <CardDescription>Used for lead enquiry and test drive bookings</CardDescription>
              </CardHeader>
              <CardContent>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="default" className="gap-2">
                      <Zap className="size-4" />
                      <span>Open Test Enquiry Dialog</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Book a Test Drive</DialogTitle>
                      <DialogDescription>
                        Schedule a showroom test drive with 100% sanitized vehicle.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3 py-2">
                      <Input placeholder="Enter your full name" />
                      <Input placeholder="Phone number (WhatsApp)" />
                    </div>
                    <DialogFooter>
                      <Button variant="default">Submit Request</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sheet (Slide-Over Drawer)</CardTitle>
                <CardDescription>Used for mobile inventory filters</CardDescription>
              </CardHeader>
              <CardContent>
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="gap-2">
                      <SlidersHorizontal className="size-4" />
                      <span>Open Filter Sheet Drawer</span>
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right">
                    <SheetHeader>
                      <SheetTitle>Filter Car Inventory</SheetTitle>
                      <SheetDescription>
                        Refine cars by price, fuel type, transmission, and year.
                      </SheetDescription>
                    </SheetHeader>
                    <div className="space-y-4 py-6">
                      <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase text-muted-foreground">
                          Fuel Type
                        </label>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="default">Petrol</Badge>
                          <Badge variant="outline">Diesel</Badge>
                          <Badge variant="outline">Electric</Badge>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase text-muted-foreground">
                          Ownership
                        </label>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="secondary">1st Owner</Badge>
                          <Badge variant="outline">2nd Owner</Badge>
                        </div>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
              </CardContent>
            </Card>
          </div>

          {/* Sub-block: Tabs, Accordion, Table & Skeleton */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Tabs (Car Details)</CardTitle>
                <CardDescription>Switch between vehicle information</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="overview">
                  <TabsList className="w-full">
                    <TabsTrigger value="overview" className="flex-1">Overview</TabsTrigger>
                    <TabsTrigger value="specs" className="flex-1">Specifications</TabsTrigger>
                    <TabsTrigger value="warranty" className="flex-1">Warranty</TabsTrigger>
                  </TabsList>
                  <TabsContent value="overview" className="p-3 text-sm text-muted-foreground">
                    2022 BMW 3 Series 330i M Sport with panoramic sunroof, ambient lighting, and complete BMW service history.
                  </TabsContent>
                  <TabsContent value="specs" className="p-3 text-sm text-muted-foreground">
                    2.0L Turbo Petrol • 258 BHP • Automatic • 28,400 KM • DL RTO
                  </TabsContent>
                  <TabsContent value="warranty" className="p-3 text-sm text-muted-foreground">
                    12-Month Comprehensive Dealership Warranty included + 150-Point Inspection Report.
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Accordion (FAQs)</CardTitle>
                <CardDescription>Frequently asked questions module</CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1">
                    <AccordionTrigger>Is the price negotiable?</AccordionTrigger>
                    <AccordionContent>
                      We operate on a transparent fixed-price policy verified against market benchmarks, eliminating haggling.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-2">
                    <AccordionTrigger>Who handles the RC transfer?</AccordionTrigger>
                    <AccordionContent>
                      The dealership manages the complete RTO ownership transfer paperwork at no additional charge to the buyer.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          </div>

          {/* Sub-block: Table & Skeleton */}
          <Card>
            <CardHeader>
              <CardTitle>Data Table & Skeleton Loading State</CardTitle>
              <CardDescription>Used in Admin inventory and car comparison sheets</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Car Model</TableHead>
                    <TableHead>Year / KM</TableHead>
                    <TableHead>Fuel</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">2021 VW Polo GT 1.0 TSI</TableCell>
                    <TableCell>2021 • 34,200 km</TableCell>
                    <TableCell>Petrol</TableCell>
                    <TableCell className="font-semibold text-primary">₹8.95 Lakh</TableCell>
                    <TableCell><Badge variant="success">Available</Badge></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">2020 Hyundai Creta SX(O)</TableCell>
                    <TableCell>2020 • 48,000 km</TableCell>
                    <TableCell>Diesel</TableCell>
                    <TableCell className="font-semibold text-primary">₹14.20 Lakh</TableCell>
                    <TableCell><Badge variant="featured">Reserved</Badge></TableCell>
                  </TableRow>
                </TableBody>
              </Table>

              <div className="space-y-2 pt-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase">Skeleton Loading Demo</p>
                <div className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sub-block: Form with react-hook-form + zod */}
          <Card>
            <CardHeader>
              <CardTitle>Validated Form (react-hook-form + zod)</CardTitle>
              <CardDescription>Forms base testing schema validation and error handling</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-w-xl">
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Omar Al-Sharif" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="omar@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="carBudget"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Budget Preference</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select your budget" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="under-10">Under ₹10 Lakhs</SelectItem>
                            <SelectItem value="10-25">₹10 Lakhs - ₹25 Lakhs</SelectItem>
                            <SelectItem value="25-50">₹25 Lakhs - ₹50 Lakhs</SelectItem>
                            <SelectItem value="above-50">Above ₹50 Lakhs</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>We customize recommendations to this band.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="gap-2">
                    <CheckCircle2 className="size-4" />
                    <span>Validate & Submit Form</span>
                  </Button>
                </form>
              </Form>

              {formSubmitted && (
                <div className="mt-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs font-mono text-emerald-700 dark:text-emerald-300">
                  <p className="font-semibold mb-1">Form Validated Successfully:</p>
                  <pre>{formSubmitted}</pre>
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        {/* SECTION 3: VENGEANCE UI PREMIUM MODULES */}
        <section className="space-y-6">
          <div className="flex items-center gap-3 border-b border-border pb-3">
            <Sparkles className="size-6 text-primary" />
            <div>
              <h2 className="text-2xl font-bold tracking-tight">3. Vengeance UI Animated Modules</h2>
              <p className="text-sm text-muted-foreground">
                Premium visual components built for automotive marketplace elegance.
              </p>
            </div>
          </div>

          {/* Marquee demonstration */}
          <div className="space-y-3">
            <h3 className="text-base font-semibold">Testimonial & Trust Marquee</h3>
            <p className="text-xs text-muted-foreground">
              Hardware-accelerated continuous loop ticker with pause-on-hover.
            </p>
            <div className="rounded-xl border border-border bg-card p-4">
              <Marquee speed="normal" pauseOnHover={true}>
                {[
                  { text: "150+ Checkpoint Certified", badge: "Inspection" },
                  { text: "7-Day Money Back Guarantee", badge: "Trust" },
                  { text: "Free RC Transfer", badge: "RTO" },
                  { text: "Comprehensive 1-Yr Warranty", badge: "Protection" },
                  { text: "Instant Online Car Valuation", badge: "Sell Car" },
                  { text: "Lowest Pan-India EMI Rates", badge: "Finance" },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2.5 rounded-full border border-border bg-muted/40 px-4 py-2 text-sm shadow-xs"
                  >
                    <ShieldCheck className="size-4 text-primary" />
                    <span className="font-medium">{item.text}</span>
                    <Badge variant="outline" className="text-[10px] py-0">{item.badge}</Badge>
                  </div>
                ))}
              </Marquee>
            </div>
          </div>

          {/* Spotlight Cards demonstration */}
          <div className="space-y-3">
            <h3 className="text-base font-semibold">Interactive Spotlight Cards</h3>
            <p className="text-xs text-muted-foreground">
              Dynamic radial spotlight tracking cursor coordinates in real-time.
            </p>
            <div className="grid gap-6 sm:grid-cols-3">
              <SpotlightCard>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="featured">New Arrival</Badge>
                    <span className="text-xs text-muted-foreground">DL RTO</span>
                  </div>
                  <h4 className="text-lg font-bold">2022 BMW M340i xDrive</h4>
                  <p className="text-sm text-muted-foreground">
                    18,500 km • Petrol • Tanzanite Blue
                  </p>
                  <div className="pt-2 flex items-center justify-between">
                    <span className="text-xl font-bold text-primary">₹58.5 L</span>
                    <Button size="sm" variant="outline" className="gap-1 text-xs">
                      <span>View</span>
                      <ChevronRight className="size-3" />
                    </Button>
                  </div>
                </div>
              </SpotlightCard>

              <SpotlightCard>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="success">Fixed Price</Badge>
                    <span className="text-xs text-muted-foreground">HR RTO</span>
                  </div>
                  <h4 className="text-lg font-bold">2021 Porsche Macan 2.0</h4>
                  <p className="text-sm text-muted-foreground">
                    24,000 km • Petrol • White Carrera
                  </p>
                  <div className="pt-2 flex items-center justify-between">
                    <span className="text-xl font-bold text-primary">₹69.0 L</span>
                    <Button size="sm" variant="outline" className="gap-1 text-xs">
                      <span>View</span>
                      <ChevronRight className="size-3" />
                    </Button>
                  </div>
                </div>
              </SpotlightCard>

              <SpotlightCard>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary">1st Owner</Badge>
                    <span className="text-xs text-muted-foreground">UP RTO</span>
                  </div>
                  <h4 className="text-lg font-bold">2023 Audi Q5 Technology</h4>
                  <p className="text-sm text-muted-foreground">
                    14,200 km • Petrol • Mythos Black
                  </p>
                  <div className="pt-2 flex items-center justify-between">
                    <span className="text-xl font-bold text-primary">₹52.0 L</span>
                    <Button size="sm" variant="outline" className="gap-1 text-xs">
                      <span>View</span>
                      <ChevronRight className="size-3" />
                    </Button>
                  </div>
                </div>
              </SpotlightCard>
            </div>
          </div>
        </section>

        {/* SECTION 4: MOTION VARIANTS INTERACTIVE SANITY-CHECK */}
        <section className="space-y-6">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-3">
              <Zap className="size-6 text-primary" />
              <div>
                <h2 className="text-2xl font-bold tracking-tight">4. Motion Animation Variants</h2>
                <p className="text-sm text-muted-foreground">
                  Test the 4 shared hardware-accelerated variants (transform & opacity only).
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMotionKey((k) => k + 1)}
              className="gap-2"
            >
              <RotateCw className="size-3.5" />
              <span>Replay Animations</span>
            </Button>
          </div>

          <div key={motionKey} className="grid gap-6 md:grid-cols-2">
            {/* Variant 1: fadeUp */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">fadeUp Variant</CardTitle>
                <CardDescription>Y-translation + opacity elevation</CardDescription>
              </CardHeader>
              <CardContent>
                <motion.div
                  variants={fadeUp}
                  initial="hidden"
                  animate="visible"
                  className="rounded-lg border border-primary/20 bg-primary/5 p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-primary/20 p-2 text-primary">
                      <Car className="size-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">fadeUp animated block</p>
                      <p className="text-xs text-muted-foreground">
                        Translates 20px up with 0.4s cubic-bezier curve.
                      </p>
                    </div>
                  </div>
                </motion.div>
              </CardContent>
            </Card>

            {/* Variant 2: scaleIn */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">scaleIn Variant</CardTitle>
                <CardDescription>Scale 0.95 to 1.0 with opacity</CardDescription>
              </CardHeader>
              <CardContent>
                <motion.div
                  variants={scaleIn}
                  initial="hidden"
                  animate="visible"
                  className="rounded-lg border border-border bg-card p-4 shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-emerald-500/20 p-2 text-emerald-500">
                      <CheckCircle2 className="size-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">scaleIn animated card</p>
                      <p className="text-xs text-muted-foreground">
                        Ideal for modals, dialogs, and dynamic highlight chips.
                      </p>
                    </div>
                  </div>
                </motion.div>
              </CardContent>
            </Card>

            {/* Variant 3: slideInFromRight */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">slideInFromRight Variant</CardTitle>
                <CardDescription>X-translation 24px to 0</CardDescription>
              </CardHeader>
              <CardContent>
                <motion.div
                  variants={slideInFromRight}
                  initial="hidden"
                  animate="visible"
                  className="rounded-lg border border-border bg-card p-4 shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-blue-500/20 p-2 text-blue-500">
                      <ChevronRight className="size-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">slideInFromRight card</p>
                      <p className="text-xs text-muted-foreground">
                        Used for multi-step forms and mobile sidebars.
                      </p>
                    </div>
                  </div>
                </motion.div>
              </CardContent>
            </Card>

            {/* Variant 4: staggerContainer */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">staggerContainer Variant</CardTitle>
                <CardDescription>Sequential cascade for child elements</CardDescription>
              </CardHeader>
              <CardContent>
                <motion.div
                  variants={staggerContainer}
                  initial="hidden"
                  animate="visible"
                  className="grid grid-cols-3 gap-2"
                >
                  {[1, 2, 3].map((num) => (
                    <motion.div
                      key={num}
                      variants={fadeUp}
                      className="rounded-md border border-border bg-muted/50 p-2.5 text-center text-xs font-medium"
                    >
                      Stagger #{num}
                    </motion.div>
                  ))}
                </motion.div>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </div>
  );
}
