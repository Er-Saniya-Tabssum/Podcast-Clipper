import Link from "next/link";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { ThemeToggle } from "~/components/theme-toggle";

export default function HomePage() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Navigation Bar */}
      <nav className="absolute top-0 right-0 left-0 z-50 p-6">
        <div className="container mx-auto flex items-center justify-between">
          <div className="text-xl font-bold">
            <span className="text-gradient">podcast</span>
            <span className="text-muted-foreground/50">/</span>
            <span className="text-foreground">clipper</span>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Button asChild variant="outline" size="sm">
              <Link href="/login">Sign In</Link>
            </Button>
          </div>
        </div>
      </nav>
      {/* Hero Section */}
      <section className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 pt-20">
        <div className="container mx-auto max-w-6xl text-center">
          {/* Hero Badge */}
          <div className="animate-slide-down">
            <Badge
              variant="secondary"
              className="bg-gradient-primary hover-lift mb-6 text-white"
            >
              🌿 AI-Powered • Peaceful Editing • Professional Results
            </Badge>
          </div>

          {/* Main Title */}
          <div className="animate-fade-scale">
            <h1 className="mb-6 text-5xl font-extrabold tracking-tight md:text-7xl lg:text-8xl">
              <span className="text-gradient">AI Podcast</span>
              <br />
              <span className="text-foreground">Clipper</span>
            </h1>
          </div>

          {/* Subtitle */}
          <div className="animate-slide-up" style={{ animationDelay: "0.2s" }}>
            <p className="text-muted-foreground mx-auto mb-8 max-w-3xl text-xl md:text-2xl">
              Transform full podcasts into{" "}
              <span className="text-primary font-semibold">
                viral short-form clips
              </span>{" "}
              ready for YouTube Shorts, TikTok, and social media. AI-powered
              transcription, moment detection, and automatic cropping.
            </p>
          </div>

          {/* CTA Buttons */}
          <div
            className="animate-slide-up flex flex-col gap-4 sm:flex-row sm:justify-center"
            style={{ animationDelay: "0.4s" }}
          >
            <Button
              asChild
              size="lg"
              className="bg-gradient-primary hover-lift px-8 py-6 text-lg font-semibold text-white shadow-lg hover:opacity-95"
            >
              <Link href="/login">🚀 Get Started Free</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-primary text-primary hover:bg-primary/10 hover-lift border-2 px-8 py-6 text-lg"
            >
              <Link href="/dashboard">👀 View Dashboard</Link>
            </Button>
          </div>

          {/* Social Proof */}
          <div
            className="animate-slide-up mt-12"
            style={{ animationDelay: "0.6s" }}
          >
            <p className="text-muted-foreground mb-4 text-sm">
              Trusted by content creators worldwide
            </p>
            <div className="flex items-center justify-center gap-8 opacity-60">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 animate-pulse rounded-full bg-green-500"></div>
                <span className="text-sm">1000+ Clips Generated</span>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className="h-2 w-2 animate-pulse rounded-full bg-blue-500"
                  style={{ animationDelay: "0.5s" }}
                ></div>
                <span className="text-sm">500+ Happy Creators</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 px-4 py-20">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <h2 className="text-gradient mb-4 text-4xl font-bold">
              Why Choose AI Podcast Clipper?
            </h2>
            <p className="text-muted-foreground mx-auto max-w-2xl text-xl">
              Cutting-edge AI technology meets intuitive design for the ultimate
              podcasting experience
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* Feature 1 */}
            <Card className="group hover-lift glass-effect hover:border-primary/20 animate-slide-up border-2 border-transparent">
              <CardContent className="p-8 text-center">
                <div className="bg-gradient-primary animate-float mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full text-2xl text-white">
                  🎬
                </div>
                <h3 className="text-foreground mb-4 text-2xl font-bold">
                  Smart Auto-Detection
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  AI automatically identifies viral moments, stories, and
                  engaging Q&A segments from your podcast content with 95%
                  accuracy.
                </p>
              </CardContent>
            </Card>

            {/* Feature 2 */}
            <Card
              className="group hover-lift glass-effect hover:border-primary/20 animate-slide-up border-2 border-transparent"
              style={{ animationDelay: "0.1s" }}
            >
              <CardContent className="p-8 text-center">
                <div
                  className="bg-gradient-accent animate-float mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full text-2xl text-white"
                  style={{ animationDelay: "2s" }}
                >
                  🔊
                </div>
                <h3 className="text-foreground mb-4 text-2xl font-bold">
                  AI-Generated Subtitles
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Perfect subtitles with speaker detection, active speaker
                  highlighting, and optimized cropping for maximum engagement.
                </p>
              </CardContent>
            </Card>

            {/* Feature 3 */}
            <Card
              className="group hover-lift glass-effect hover:border-primary/20 animate-slide-up border-2 border-transparent"
              style={{ animationDelay: "0.2s" }}
            >
              <CardContent className="p-8 text-center">
                <div
                  className="bg-gradient-secondary animate-float mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full text-2xl text-white"
                  style={{ animationDelay: "4s" }}
                >
                  📱
                </div>
                <h3 className="text-foreground mb-4 text-2xl font-bold">
                  Platform Optimized
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Clips perfectly formatted for TikTok, YouTube Shorts,
                  Instagram Reels, and other vertical video platforms.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 px-4 py-20">
        <div className="container mx-auto max-w-4xl text-center">
          <Card className="glass-effect border-primary/20 hover-lift border-2">
            <CardContent className="p-12">
              <h3 className="text-gradient mb-4 text-3xl font-bold">
                Ready to Go Viral?
              </h3>
              <p className="text-muted-foreground mx-auto mb-8 max-w-2xl text-xl">
                Join thousands of content creators who are already using AI
                Podcast Clipper to grow their audience and create engaging
                content.
              </p>
              <Button
                asChild
                size="lg"
                className="bg-gradient-primary hover-lift animate-pulse-glow px-12 py-6 text-xl font-semibold text-white shadow-2xl hover:opacity-90"
              >
                <Link href="/login">🎯 Start Creating Clips Now</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
