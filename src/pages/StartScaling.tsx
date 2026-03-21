import { useState, useEffect } from "react";
import { format } from "date-fns";
import { CalendarIcon, BarChart3, Target, Shield, Star, CheckCircle } from "lucide-react";
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

interface BookedSlot {
    date: string;
    time: string;
}

const StartScaling = () => {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [isBooked, setIsBooked] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date>();
    const [selectedTime, setSelectedTime] = useState("");
    const [bookedSlots, setBookedSlots] = useState<BookedSlot[]>([]);
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        workEmail: "",
        companyWebsite: "",
        primaryGoal: "",
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyKMpoVdIW10oTpKwRSgsCEAa3PWvNL94qDuvvmcKOLWVW4BL-CdNpwxXepoYHL_Uu7HQ/exec";

    // Fetch booked slots when component mounts
    useEffect(() => {
        const fetchBookedSlots = async () => {
            try {
                const response = await fetch(SCRIPT_URL);
                const data = await response.json();
                // Ensure data is an array before setting
                if (Array.isArray(data)) {
                    setBookedSlots(data);
                }
            } catch (error) {
                console.error("Failed to fetch booked slots:", error);
            }
        };

        fetchBookedSlots();
    }, []);

    // Check if a specific time slot is booked for the selected date
    const isTimeSlotBooked = (time: string) => {
        if (!selectedDate) return false;
        const dateStr = format(selectedDate, "yyyy-MM-dd");
        return bookedSlots.some(slot => slot.date === dateStr && slot.time === time);
    };

    // Get available time slots for the selected date
    const getAvailableTimeSlots = () => {
        return timeSlots.filter(time => !isTimeSlotBooked(time));
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.firstName.trim()) {
            newErrors.firstName = "First name is required";
        }

        if (!formData.workEmail.trim()) {
            newErrors.workEmail = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.workEmail)) {
            newErrors.workEmail = "Please enter a valid email address";
        }

        if (!formData.companyWebsite.trim()) {
            newErrors.companyWebsite = "Company website is required";
        } else if (!/^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/.test(formData.companyWebsite)) {
            newErrors.companyWebsite = "Please enter a valid website URL";
        }

        if (!selectedDate) {
            newErrors.callDate = "Please select a date";
        }

        if (!selectedTime) {
            newErrors.callTime = "Please select a time";
        } else if (isTimeSlotBooked(selectedTime)) {
            newErrors.callTime = "This time slot is no longer available. Please select another time.";
            setSelectedTime("");
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: "" }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            toast({
                title: "Validation Error",
                description: "Please fill in all required fields correctly.",
                variant: "destructive",
            });
            return;
        }

        // Client-side duplicate check before submitting
        if (isTimeSlotBooked(selectedTime)) {
            toast({
                title: "Time Slot Unavailable",
                description: "Sorry, this time slot was just booked. Please select another time.",
                variant: "destructive",
            });
            setSelectedTime("");
            return;
        }

        setIsLoading(true);

        try {
            // no-cors is required for Google Apps Script from a browser
            // We cannot read the response body with no-cors, so we optimistically
            // update the UI and rely on client-side duplicate checking
            await fetch(SCRIPT_URL, {
                method: "POST",
                mode: "no-cors",
                headers: {
                    "Content-Type": "text/plain", // must be text/plain with no-cors
                },
                body: JSON.stringify({
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    workEmail: formData.workEmail,
                    companyWebsite: formData.companyWebsite,
                    primaryGoal: formData.primaryGoal,
                    callDate: format(selectedDate!, "yyyy-MM-dd"),
                    callTime: selectedTime,
                }),
            });

            // Optimistically add the booked slot to local state so it's
            // immediately blocked for any other bookings in this session
            setBookedSlots(prev => [...prev, {
                date: format(selectedDate!, "yyyy-MM-dd"),
                time: selectedTime,
            }]);

            setIsBooked(true);

            toast({
                title: "Call Booked!",
                description: "Your strategy call has been scheduled. Check your email for confirmation.",
            });

            // Reset form
            setFormData({
                firstName: "",
                lastName: "",
                workEmail: "",
                companyWebsite: "",
                primaryGoal: "",
            });
            setSelectedDate(undefined);
            setSelectedTime("");

        } catch (err) {
            toast({
                title: "Error",
                description: "Something went wrong. Please try again.",
                variant: "destructive",
            });
        }

        setIsLoading(false);
    };

    const availableTimeSlots = selectedDate ? getAvailableTimeSlots() : [];

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
                                <p className="text-sm text-muted-foreground">Scaled & Growthe Company/Startups</p>
                            </div>
                        </div>
                    </div>

                    {/* Right - Form */}
                    <div className="rounded-2xl border border-border bg-card p-8">
                        {isBooked ? (
                            <div className="text-center py-8">
                                <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                                </div>
                                <h2 className="text-2xl font-bold mb-2">Call Booked Successfully!</h2>
                                <p className="text-muted-foreground mb-6">
                                    You have booked the call. Check your email for the confirmation and meeting details.
                                </p>
                                <button
                                    onClick={() => setIsBooked(false)}
                                    className="text-primary hover:underline text-sm"
                                >
                                    Book another call
                                </button>
                            </div>
                        ) : (
                            <>
                                <h2 className="text-2xl font-bold mb-1">Book a Strategy Call</h2>
                                <p className="text-sm text-muted-foreground mb-8">Pick a date & time that works for you.</p>

                                <form onSubmit={handleSubmit} className="space-y-5">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm font-medium mb-1.5 block">
                                                First Name <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                name="firstName"
                                                value={formData.firstName}
                                                onChange={handleChange}
                                                placeholder="Jane"
                                                className={cn(
                                                    "w-full rounded-lg border bg-secondary px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring",
                                                    errors.firstName ? "border-red-500" : "border-border"
                                                )}
                                            />
                                            {errors.firstName && (
                                                <p className="text-xs text-red-500 mt-1">{errors.firstName}</p>
                                            )}
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
                                        <label className="text-sm font-medium mb-1.5 block">
                                            Work Email <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            name="workEmail"
                                            type="email"
                                            value={formData.workEmail}
                                            onChange={handleChange}
                                            placeholder="jane@yourbrand.com"
                                            className={cn(
                                                "w-full rounded-lg border bg-secondary px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring",
                                                errors.workEmail ? "border-red-500" : "border-border"
                                            )}
                                        />
                                        {errors.workEmail && (
                                            <p className="text-xs text-red-500 mt-1">{errors.workEmail}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium mb-1.5 block">
                                            Company Website <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            name="companyWebsite"
                                            value={formData.companyWebsite}
                                            onChange={handleChange}
                                            placeholder="https://yourbrand.com"
                                            className={cn(
                                                "w-full rounded-lg border bg-secondary px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring",
                                                errors.companyWebsite ? "border-red-500" : "border-border"
                                            )}
                                        />
                                        {errors.companyWebsite && (
                                            <p className="text-xs text-red-500 mt-1">{errors.companyWebsite}</p>
                                        )}
                                    </div>

                                    {/* Call Session - Date Picker */}
                                    <div>
                                        <label className="text-sm font-medium mb-1.5 block">
                                            Call Session <span className="text-red-500">*</span>
                                        </label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <button
                                                    type="button"
                                                    className={cn(
                                                        "w-full rounded-lg border bg-secondary px-4 py-3 text-sm text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-ring",
                                                        errors.callDate ? "border-red-500" : "border-border",
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
                                                    onSelect={(date) => {
                                                        setSelectedDate(date);
                                                        setSelectedTime("");
                                                        if (errors.callDate) {
                                                            setErrors((prev) => ({ ...prev, callDate: "" }));
                                                        }
                                                    }}
                                                    disabled={(date) => date < new Date() || date.getDay() === 0 || date.getDay() === 6}
                                                    initialFocus
                                                    className={cn("p-3 pointer-events-auto")}
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        {errors.callDate && (
                                            <p className="text-xs text-red-500 mt-1">{errors.callDate}</p>
                                        )}
                                    </div>

                                    {/* Time Slot */}
                                    {selectedDate && (
                                        <div>
                                            <label className="text-sm font-medium mb-1.5 block">
                                                Select Time <span className="text-red-500">*</span> — {format(selectedDate, "EEE, MMM d")}
                                            </label>
                                            {availableTimeSlots.length > 0 ? (
                                                <>
                                                    <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto pr-1">
                                                        {availableTimeSlots.map((time) => (
                                                            <button
                                                                key={time}
                                                                type="button"
                                                                onClick={() => {
                                                                    setSelectedTime(time);
                                                                    if (errors.callTime) {
                                                                        setErrors((prev) => ({ ...prev, callTime: "" }));
                                                                    }
                                                                }}
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
                                                    <p className="text-xs text-muted-foreground mt-2">
                                                        {availableTimeSlots.length} time slots available
                                                    </p>
                                                </>
                                            ) : (
                                                <div className="rounded-lg border border-border bg-secondary p-4 text-center">
                                                    <p className="text-sm text-muted-foreground">
                                                        No time slots available for this date. Please select another date.
                                                    </p>
                                                </div>
                                            )}
                                            {errors.callTime && (
                                                <p className="text-xs text-red-500 mt-1">{errors.callTime}</p>
                                            )}
                                        </div>
                                    )}

                                    <div>
                                        <label className="text-sm font-medium mb-1.5 block">What is your primary goal? (Optional)</label>
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
                                        disabled={isLoading || !selectedTime || availableTimeSlots.length === 0}
                                        className="w-full rounded-full bg-primary py-3.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {isLoading ? "Booking..." : "Book a Call →"}
                                    </button>

                                    <p className="text-center text-xs text-muted-foreground flex items-center justify-center gap-1.5">
                                        <Shield className="w-3.5 h-3.5" />
                                        Your information is 100% secure and confidential.
                                    </p>
                                </form>
                            </>
                        )}
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default StartScaling;