import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, BarChart3, Target, Shield, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const timeSlots = [
    "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM",
    "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM",
    "1:00 PM", "1:30 PM", "2:00 PM", "2:30 PM",
    "3:00 PM", "3:30 PM", "4:00 PM", "4:30 PM",
    "5:00 PM",
];

const StartScaling = () => {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date>();
    const [selectedTime, setSelectedTime] = useState("");
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        workEmail: "",
        companyWebsite: "",
        primaryGoal: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedDate || !selectedTime) return;

        setIsLoading(true);

        try {
            await fetch("https://script.google.com/macros/s/AKfycbx8sPP1A2hVHECPP48c-k00zZRIi6S595RaqZ_ofJtbgpqxr6oaGGGaA193-1aQriq3/exec", {
                method: "POST",
                body: JSON.stringify({
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    workEmail: formData.workEmail,
                    companyWebsite: formData.companyWebsite,
                    primaryGoal: formData.primaryGoal,
                    callDate: format(selectedDate, "yyyy-MM-dd"),
                    callTime: selectedTime,
                }),
            });

            toast({
                title: "Call Booked!",
                description: "Your strategy call has been scheduled.",
            });

        } catch (err) {
            toast({
                title: "Error",
                description: "Something went wrong.",
                variant: "destructive",
            });
        }

        setIsLoading(false);
    };

    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            <section className="container mx-auto px-4 py-16">
                <div className="grid md:grid-cols-2 gap-16 items-start">
                    {/* Left */}
                    <div className="pt-8">
                        <span className="inline-block rounded-full border border-border px-4 py-1.5 text-sm text-muted-foreground mb-8">
                            Step 1 of 2
                        </span>
                        <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
                            Let's build your{" "}
                            <span className="font-serif italic font-normal text-muted-foreground">growth engine.</span>
                        </h1>
                        <p className="text-muted-foreground mb-12 max-w-md">
                            Tell us a bit about your brand and current performance.
                            We'll analyze your data and craft a custom roadmap for scale.
                        </p>

                        <div className="space-y-8">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                    <BarChart3 className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <h3 className="font-semibold mb-1">Free Account Audit</h3>
                                    <p className="text-sm text-muted-foreground">
                                        We'll uncover hidden inefficiencies in your current ad campaigns and provide actionable insights.
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                    <Target className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <h3 className="font-semibold mb-1">Custom Growth Strategy</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Get a tailored multi-channel strategy designed specifically for your brand's unique goals and unit economics.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-12 pt-8 border-t border-border flex items-center gap-3">
                            <div className="flex -space-x-2">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="w-8 h-8 rounded-full bg-muted border-2 border-background" />
                                ))}
                            </div>
                            <div>
                                <div className="flex text-primary text-sm">
                                    {[1, 2, 3, 4, 5].map((i) => (
                                        <Star key={i} className="w-4 h-4 fill-current" />
                                    ))}
                                </div>
                                <p className="text-sm text-muted-foreground"> Scaled & Growthe Company/Startups</p>
                            </div>
                        </div>
                    </div>

                    {/* Right - Form */}
                    <div className="rounded-2xl border border-border bg-card p-8">
                        <h2 className="text-2xl font-bold mb-1">Book a Strategy Call</h2>
                        <p className="text-sm text-muted-foreground mb-8">Pick a date & time that works for you.</p>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium mb-1.5 block">First Name</label>
                                    <input
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        placeholder="Jane"
                                        className="w-full rounded-lg border border-border bg-secondary px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-1.5 block">Last Name</label>
                                    <input
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleChange}
                                        placeholder="Doe"
                                        className="w-full rounded-lg border border-border bg-secondary px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-medium mb-1.5 block">Work Email</label>
                                <input
                                    name="workEmail"
                                    type="email"
                                    value={formData.workEmail}
                                    onChange={handleChange}
                                    placeholder="jane@yourbrand.com"
                                    className="w-full rounded-lg border border-border bg-secondary px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium mb-1.5 block">Company Website</label>
                                <input
                                    name="companyWebsite"
                                    value={formData.companyWebsite}
                                    onChange={handleChange}
                                    placeholder="https://yourbrand.com"
                                    className="w-full rounded-lg border border-border bg-secondary px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                                />
                            </div>

                            {/* Call Session - Date Picker */}
                            <div>
                                <label className="text-sm font-medium mb-1.5 block">Call Session</label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <button
                                            type="button"
                                            className={cn(
                                                "w-full rounded-lg border border-border bg-secondary px-4 py-3 text-sm text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-ring",
                                                selectedDate ? "text-foreground" : "text-muted-foreground"
                                            )}
                                        >
                                            {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                                            <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                                        </button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={selectedDate}
                                            onSelect={setSelectedDate}
                                            disabled={(date) => date < new Date() || date.getDay() === 0 || date.getDay() === 6}
                                            initialFocus
                                            className={cn("p-3 pointer-events-auto")}
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>

                            {/* Time Slot */}
                            {selectedDate && (
                                <div>
                                    <label className="text-sm font-medium mb-1.5 block">
                                        Select Time — {format(selectedDate, "EEE, MMM d")}
                                    </label>
                                    <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto pr-1">
                                        {timeSlots.map((time) => (
                                            <button
                                                key={time}
                                                type="button"
                                                onClick={() => setSelectedTime(time)}
                                                className={cn(
                                                    "rounded-lg border px-3 py-2 text-xs font-medium transition-colors",
                                                    selectedTime === time
                                                        ? "border-primary bg-primary text-primary-foreground"
                                                        : "border-border bg-secondary text-muted-foreground hover:text-foreground hover:border-foreground/30"
                                                )}
                                            >
                                                {time}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="text-sm font-medium mb-1.5 block">What is your primary goal?</label>
                                <textarea
                                    name="primaryGoal"
                                    value={formData.primaryGoal}
                                    onChange={handleChange}
                                    placeholder="e.g. Decrease CPA by 20% while doubling spend..."
                                    rows={3}
                                    className="w-full rounded-lg border border-border bg-secondary px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full rounded-full bg-primary py-3.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isLoading ? "Booking..." : "Book a Call →"}
                            </button>

                            <p className="text-center text-xs text-muted-foreground flex items-center justify-center gap-1.5">
                                <Shield className="w-3.5 h-3.5" />
                                Your information is 100% secure and confidential.
                            </p>
                        </form>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default StartScaling;
