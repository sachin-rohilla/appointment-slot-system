"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Clock,
  Users,
  ArrowRight,
  Star,
  Shield,
  Zap,
} from "lucide-react";
import Link from "next/link";

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Navigation */}
      <nav className="glass-effect border-b border-gray-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-xl shadow-lg">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold font-display text-gray-900">
                SlotBook
              </span>
            </div>

            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <Link href="/dashboard">
                  <Button className="button-gradient">Dashboard</Button>
                </Link>
              ) : (
                <>
                  <Link href="/auth/login">
                    <Button variant="ghost" className="font-medium">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/auth/register">
                    <Button className="button-gradient">Get Started</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center animate-fadeInUp">
          <Badge className="mb-6 bg-blue-100 text-blue-800 hover:bg-blue-100 font-medium">
            Smart Appointment Scheduling
          </Badge>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold font-display text-gray-900 mb-6 leading-tight">
            Book Appointments
            <span className="block text-gradient mt-2">With Ease</span>
          </h1>

          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed font-medium">
            Streamline your appointment scheduling with our intelligent booking
            system. Perfect for healthcare providers, consultants, and service
            professionals.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register">
              <Button
                size="lg"
                className="button-gradient text-lg px-8 py-4 h-14"
              >
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/slots">
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 py-4 h-14 border-2 hover:border-blue-600 font-medium"
              >
                Browse Available Slots
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold font-display text-gray-900 mb-4">
              Why Choose SlotBook?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto font-medium">
              Experience the future of appointment scheduling with our powerful
              features
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center p-8 border-0 shadow-xl hover-lift card-gradient">
              <CardContent className="pt-6">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <Zap className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-semibold font-display text-gray-900 mb-4">
                  Instant Booking
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Book appointments in real-time with our lightning-fast booking
                  system. No more waiting or back-and-forth emails.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-8 border-0 shadow-xl hover-lift card-gradient">
              <CardContent className="pt-6">
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-semibold font-display text-gray-900 mb-4">
                  Secure & Reliable
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Your data is protected with enterprise-grade security. Trust
                  us with your sensitive appointment information.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-8 border-0 shadow-xl hover-lift card-gradient">
              <CardContent className="pt-6">
                <div className="bg-gradient-to-r from-green-500 to-green-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-semibold font-display text-gray-900 mb-4">
                  User-Friendly
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Intuitive interface designed for both providers and patients.
                  No technical expertise required.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div className="animate-fadeInUp">
              <div className="text-5xl font-bold text-white mb-2 font-display">
                10,000+
              </div>
              <div className="text-blue-100 font-medium">
                Appointments Booked
              </div>
            </div>
            <div
              className="animate-fadeInUp"
              style={{ animationDelay: "0.1s" }}
            >
              <div className="text-5xl font-bold text-white mb-2 font-display">
                500+
              </div>
              <div className="text-blue-100 font-medium">
                Healthcare Providers
              </div>
            </div>
            <div
              className="animate-fadeInUp"
              style={{ animationDelay: "0.2s" }}
            >
              <div className="text-5xl font-bold text-white mb-2 font-display">
                99.9%
              </div>
              <div className="text-blue-100 font-medium">Uptime</div>
            </div>
            <div
              className="animate-fadeInUp"
              style={{ animationDelay: "0.3s" }}
            >
              <div className="text-5xl font-bold text-white mb-2 font-display">
                4.9/5
              </div>
              <div className="text-blue-100 font-medium">User Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold font-display text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 font-medium">
              Get started in three simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center animate-fadeInUp">
              <div className="bg-white w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl border-2 border-blue-600">
                <span className="text-3xl font-bold text-blue-600 font-display">
                  1
                </span>
              </div>
              <h3 className="text-2xl font-semibold font-display text-gray-900 mb-4">
                Sign Up
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Create your free account in seconds
              </p>
            </div>

            <div
              className="text-center animate-fadeInUp"
              style={{ animationDelay: "0.1s" }}
            >
              <div className="bg-white w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl border-2 border-purple-600">
                <span className="text-3xl font-bold text-purple-600 font-display">
                  2
                </span>
              </div>
              <h3 className="text-2xl font-semibold font-display text-gray-900 mb-4">
                Browse Slots
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Find available appointment times
              </p>
            </div>

            <div
              className="text-center animate-fadeInUp"
              style={{ animationDelay: "0.2s" }}
            >
              <div className="bg-white w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl border-2 border-green-600">
                <span className="text-3xl font-bold text-green-600 font-display">
                  3
                </span>
              </div>
              <h3 className="text-2xl font-semibold font-display text-gray-900 mb-4">
                Book Instantly
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Confirm your appointment with one click
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold font-display text-white mb-4">
            Ready to Transform Your Appointment Scheduling?
          </h2>
          <p className="text-xl text-blue-100 mb-8 font-medium">
            Join thousands of healthcare professionals who trust SlotBook
          </p>
          <Link href="/auth/register">
            <Button
              size="lg"
              className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-4 h-14 font-semibold hover:scale-105 transition-transform"
            >
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-xl">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold font-display">SlotBook</span>
              </div>
              <p className="text-gray-400 leading-relaxed">
                Smart appointment scheduling for modern healthcare practices.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-4 font-display">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link
                    href="/features"
                    className="hover:text-white transition-colors"
                  >
                    Features
                  </Link>
                </li>
                <li>
                  <Link
                    href="/pricing"
                    className="hover:text-white transition-colors"
                  >
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link
                    href="/integrations"
                    className="hover:text-white transition-colors"
                  >
                    Integrations
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4 font-display">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link
                    href="/about"
                    className="hover:text-white transition-colors"
                  >
                    About
                  </Link>
                </li>
                <li>
                  <Link
                    href="/blog"
                    className="hover:text-white transition-colors"
                  >
                    Blog
                  </Link>
                </li>
                <li>
                  <Link
                    href="/careers"
                    className="hover:text-white transition-colors"
                  >
                    Careers
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4 font-display">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link
                    href="/help"
                    className="hover:text-white transition-colors"
                  >
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="hover:text-white transition-colors"
                  >
                    Contact
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacy"
                    className="hover:text-white transition-colors"
                  >
                    Privacy
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 SlotBook. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
