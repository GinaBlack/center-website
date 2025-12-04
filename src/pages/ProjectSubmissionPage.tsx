import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group";
import { Badge } from "../components/ui/badge";
import { Upload, FileText, Calculator, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Progress } from "../components/ui/progress";

export function ProjectSubmissionPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1: Basic Info
    projectName: "",
    name: "",
    email: "",
    phone: "",
    
    // Step 2: Technical Details
    technology: "",
    material: "",
    color: "",
    quantity: "1",
    
    // Step 3: Specifications
    infill: "20",
    layerHeight: "0.2",
    supportType: "auto",
    
    // Step 4: Additional Services
    postProcessing: [] as string[],
    rushOrder: false,
    
    // Step 5: Additional Info
    notes: "",
    files: [] as File[]
  });

  const [estimatedPrice, setEstimatedPrice] = useState(0);
  const [estimatedTime, setEstimatedTime] = useState("3-5");

  const handleInputChange = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
    calculateEstimate({ ...formData, [field]: value });
  };

  const calculateEstimate = (data: typeof formData) => {
    let basePrice = 15000; // Base price in XAF
    const quantity = parseInt(data.quantity) || 1;
    
    // Technology multiplier
    if (data.technology === "resin") basePrice *= 1.8;
    else if (data.technology === "scanning") basePrice = 45000;
    
    // Material multiplier
    if (data.material.includes("Carbon") || data.material.includes("Nylon")) basePrice *= 1.5;
    
    // Post-processing
    const processingCost = data.postProcessing.length * 9000;
    
    // Rush order
    if (data.rushOrder) basePrice *= 1.5;
    
    const total = (basePrice * quantity) + processingCost;
    setEstimatedPrice(total);
    
    // Estimate time
    if (data.rushOrder) {
      setEstimatedTime("1-2");
    } else if (quantity > 10) {
      setEstimatedTime("5-7");
    } else {
      setEstimatedTime("3-5");
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setFormData({ ...formData, files });
    toast.success(`${files.length} file(s) uploaded`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate that files are uploaded
    if (formData.files.length === 0) {
      toast.error("Please upload at least one 3D file before submitting");
      return;
    }
    
    toast.success("Project submitted successfully! We'll contact you within 24 hours.");
    // Reset form
    setFormData({
      projectName: "",
      name: "",
      email: "",
      phone: "",
      technology: "",
      material: "",
      color: "",
      quantity: "1",
      infill: "20",
      layerHeight: "0.2",
      supportType: "auto",
      postProcessing: [],
      rushOrder: false,
      notes: "",
      files: []
    });
    setStep(1);
  };

  const handleNextStep = () => {
    // Validate current step before proceeding
    if (step === 1) {
      if (!formData.projectName || !formData.name || !formData.email) {
        toast.error("Please fill in all required fields");
        return;
      }
    } else if (step === 2) {
      if (!formData.technology || !formData.material) {
        toast.error("Please select technology and material");
        return;
      }
    } else if (step === 3) {
      if (!formData.layerHeight || !formData.supportType) {
        toast.error("Please complete print specifications");
        return;
      }
    }
    
    setStep(step + 1);
  };

  const progress = (step / 5) * 100;

  return (
    <div className="pt-16 min-h-screen bg-muted/30">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="tracking-tight mb-4">Submit Your Project</h1>
          <p className="text-muted-foreground">
            Complete the form below to get an instant quote and submit your 3D printing project
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2 text-sm">
            <span className="text-muted-foreground">Step {step} of 5</span>
            <span className="text-muted-foreground">{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} />
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>
                  {step === 1 && "Basic Information"}
                  {step === 2 && "Technology & Material"}
                  {step === 3 && "Print Specifications"}
                  {step === 4 && "Additional Services"}
                  {step === 5 && "Files & Notes"}
                </CardTitle>
                <CardDescription>
                  {step === 1 && "Tell us about your project and contact details"}
                  {step === 2 && "Choose your printing technology and material"}
                  {step === 3 && "Specify print quality and settings"}
                  {step === 4 && "Select any additional services you need"}
                  {step === 5 && "Upload files and add any special instructions"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit}>
                  {/* Step 1: Basic Info */}
                  {step === 1 && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="projectName">Project Name *</Label>
                        <Input
                          id="projectName"
                          value={formData.projectName}
                          onChange={(e) => handleInputChange("projectName", e.target.value)}
                          placeholder="My awesome project"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="name">Your Name *</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => handleInputChange("name", e.target.value)}
                          placeholder="John Doe"
                          required
                        />
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="email">Email *</Label>
                          <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => handleInputChange("email", e.target.value)}
                            placeholder="john@example.com"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone</Label>
                          <Input
                            id="phone"
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => handleInputChange("phone", e.target.value)}
                            placeholder="+1 (555) 123-4567"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 2: Technology & Material */}
                  {step === 2 && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Technology *</Label>
                        <RadioGroup
                          value={formData.technology}
                          onValueChange={(value) => handleInputChange("technology", value)}
                        >
                          <div className="flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:bg-muted">
                            <RadioGroupItem value="fdm" id="fdm" />
                            <Label htmlFor="fdm" className="cursor-pointer flex-1">
                              <div>FDM Printing</div>
                              <div className="text-xs text-muted-foreground">
                                Best for functional prototypes and larger parts
                              </div>
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:bg-muted">
                            <RadioGroupItem value="resin" id="resin" />
                            <Label htmlFor="resin" className="cursor-pointer flex-1">
                              <div>Resin Printing (SLA/DLP)</div>
                              <div className="text-xs text-muted-foreground">
                                High detail, smooth surface finish
                              </div>
                            </Label>
                          </div>
                        </RadioGroup>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="material">Material *</Label>
                        <Select
                          value={formData.material}
                          onValueChange={(value) => handleInputChange("material", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select material" />
                          </SelectTrigger>
                          <SelectContent>
                            {formData.technology === "fdm" ? (
                              <>
                                <SelectItem value="pla">PLA - Standard</SelectItem>
                                <SelectItem value="abs">ABS - Durable</SelectItem>
                                <SelectItem value="petg">PETG - Strong & Flexible</SelectItem>
                                <SelectItem value="tpu">TPU - Flexible</SelectItem>
                                <SelectItem value="nylon">Nylon - Industrial Grade</SelectItem>
                                <SelectItem value="carbon">Carbon Fiber - Premium</SelectItem>
                              </>
                            ) : (
                              <>
                                <SelectItem value="standard-resin">Standard Resin</SelectItem>
                                <SelectItem value="tough-resin">Tough Resin</SelectItem>
                                <SelectItem value="flexible-resin">Flexible Resin</SelectItem>
                                <SelectItem value="castable-resin">Castable Resin</SelectItem>
                              </>
                            )}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="color">Color</Label>
                          <Input
                            id="color"
                            value={formData.color}
                            onChange={(e) => handleInputChange("color", e.target.value)}
                            placeholder="e.g., Black, White, Blue"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="quantity">Quantity *</Label>
                          <Input
                            id="quantity"
                            type="number"
                            min="1"
                            value={formData.quantity}
                            onChange={(e) => handleInputChange("quantity", e.target.value)}
                            required
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 3: Specifications */}
                  {step === 3 && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="infill">Infill Density: {formData.infill}%</Label>
                        <input
                          id="infill"
                          type="range"
                          min="0"
                          max="100"
                          step="5"
                          value={formData.infill}
                          onChange={(e) => handleInputChange("infill", e.target.value)}
                          className="w-full"
                          title="Infill Density"
                          aria-label="Infill Density"
                        />
                        <p className="text-xs text-muted-foreground">
                          Higher infill = stronger but more expensive and slower
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="layerHeight">Layer Height *</Label>
                        <Select
                          value={formData.layerHeight}
                          onValueChange={(value) => handleInputChange("layerHeight", value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0.1">0.1mm - High Quality (Slower)</SelectItem>
                            <SelectItem value="0.2">0.2mm - Standard (Recommended)</SelectItem>
                            <SelectItem value="0.3">0.3mm - Draft (Faster)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="supportType">Support Type *</Label>
                        <Select
                          value={formData.supportType}
                          onValueChange={(value) => handleInputChange("supportType", value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">No Supports</SelectItem>
                            <SelectItem value="auto">Automatic Supports</SelectItem>
                            <SelectItem value="tree">Tree Supports (Easy Removal)</SelectItem>
                            <SelectItem value="custom">Custom (Discuss with Team)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}

                  {/* Step 4: Additional Services */}
                  {step === 4 && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Post-Processing Services</Label>
                        <div className="space-y-2">
                          {[
                            { id: "sanding", label: "Sanding & Smoothing", price: "+9,000 XAF" },
                            { id: "priming", label: "Priming", price: "+6,000 XAF" },
                            { id: "painting", label: "Custom Painting", price: "+15,000 XAF" },
                            { id: "assembly", label: "Assembly", price: "+12,000 XAF" }
                          ].map((service) => (
                            <div key={service.id} className="flex items-center justify-between border rounded-lg p-3">
                              <div className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  id={service.id}
                                  checked={formData.postProcessing.includes(service.id)}
                                  onChange={(e) => {
                                    const updated = e.target.checked
                                      ? [...formData.postProcessing, service.id]
                                      : formData.postProcessing.filter((s) => s !== service.id);
                                    handleInputChange("postProcessing", updated);
                                  }}
                                  className="w-4 h-4"
                                  title={service.label}
                                  aria-label={service.label}
                                  placeholder={service.label}
                                />
                                <Label htmlFor={service.id} className="cursor-pointer">
                                  {service.label}
                                </Label>
                              </div>
                              <Badge variant="secondary">{service.price}</Badge>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between border rounded-lg p-4 bg-blue-500/5">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="rushOrder"
                            checked={formData.rushOrder}
                            onChange={(e) => handleInputChange("rushOrder", e.target.checked)}
                            className="w-4 h-4"
                            title="Rush Order (24-48 hours)"
                            aria-label="Rush Order (24-48 hours)"
                          />
                          <Label htmlFor="rushOrder" className="cursor-pointer">
                            <div>Rush Order (24-48 hours)</div>
                            <div className="text-xs text-muted-foreground">
                              Get your prints delivered in 1-2 days
                            </div>
                          </Label>
                        </div>
                        <Badge>+50%</Badge>
                      </div>
                    </div>
                  )}

                  {/* Step 5: Files & Notes */}
                  {step === 5 && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="files">Upload 3D Files *</Label>
                        <div className="border-2 border-dashed rounded-lg p-8 text-center hover:bg-muted/50 transition-colors cursor-pointer">
                          <input
                            id="files"
                            type="file"
                            multiple
                            accept=".stl,.obj,.3mf,.step,.stp"
                            onChange={handleFileUpload}
                            className="hidden"
                          />
                          <label htmlFor="files" className="cursor-pointer">
                            <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                            <div className="mb-2">
                              Click to upload or drag and drop
                            </div>
                            <div className="text-xs text-muted-foreground">
                              STL, OBJ, 3MF, STEP files (Max 50MB each)
                            </div>
                          </label>
                        </div>
                        {formData.files.length > 0 && (
                          <div className="space-y-2 mt-4">
                            {formData.files.map((file, index) => (
                              <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded">
                                <FileText className="w-4 h-4" />
                                <span className="text-sm flex-1">{file.name}</span>
                                <Badge variant="secondary">{(file.size / 1024 / 1024).toFixed(2)} MB</Badge>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="notes">Additional Notes</Label>
                        <Textarea
                          id="notes"
                          value={formData.notes}
                          onChange={(e) => handleInputChange("notes", e.target.value)}
                          placeholder="Any special instructions, requirements, or questions..."
                          rows={5}
                        />
                      </div>

                      <div className="bg-muted p-4 rounded-lg space-y-2">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                          <div className="text-sm">
                            <div className="mb-1">Before submitting:</div>
                            <ul className="space-y-1 text-muted-foreground">
                              <li>• Ensure files are print-ready and manifold</li>
                              <li>• Check model orientation and scale</li>
                              <li>• Review our file guidelines for best results</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Navigation Buttons */}
                  <div className="flex gap-4 mt-8">
                    {step > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setStep(step - 1)}
                      >
                        Previous
                      </Button>
                    )}
                    {step < 5 ? (
                      <Button
                        type="button"
                        onClick={handleNextStep}
                        className="ml-auto"
                      >
                        Next Step
                      </Button>
                    ) : (
                      <Button type="submit" className="ml-auto">
                        Submit Project
                        <CheckCircle className="w-4 h-4 ml-2" />
                      </Button>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Price Estimate Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="w-5 h-5" />
                  Instant Quote
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Estimated Price</div>
                  <div className="text-foreground">{estimatedPrice.toFixed(0)} XAF</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Turnaround Time</div>
                  <div className="text-foreground">{estimatedTime} business days</div>
                </div>
                <div className="pt-4 border-t space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Quantity</span>
                    <span>{formData.quantity || 1}</span>
                  </div>
                  {formData.technology && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Technology</span>
                      <span className="capitalize">{formData.technology}</span>
                    </div>
                  )}
                  {formData.material && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Material</span>
                      <span className="capitalize">{formData.material.replace("-", " ")}</span>
                    </div>
                  )}
                  {formData.postProcessing.length > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Post-Processing</span>
                      <span>{formData.postProcessing.length} service(s)</span>
                    </div>
                  )}
                </div>
                <div className="pt-4 border-t">
                  <p className="text-xs text-muted-foreground">
                    * Final price may vary based on actual file analysis. You'll receive a detailed quote within 24 hours.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}