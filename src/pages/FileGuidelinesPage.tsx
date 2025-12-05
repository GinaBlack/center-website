import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Alert, AlertDescription } from "../components/ui/alert";
import { CheckCircle, XCircle, AlertCircle, FileText } from "lucide-react";

export function FileGuidelinesPage() {
  return (
    <div className="pt-16">
      {/* Hero Section */}
      <section className="bg-black py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="tracking-tight  text-white text-lgx mb-6">File Preparation Guidelines</h1>
            <p className="text-white text-smx">
              Ensure your 3D models are print-ready with our comprehensive file preparation guide. Follow these best practices for optimal results.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {/* File Formats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Accepted File Formats
              </CardTitle>
              <CardDescription>
                We accept the following 3D file formats
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <div className="text-lg">.STL</div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Standard Tessellation Language - Most common and recommended format for 3D printing
                  </p>
                </div>
                <div className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <div className="text-lg">.OBJ</div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Wavefront Object - Supports color and texture information
                  </p>
                </div>
                <div className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <div className="text-lg">.3MF</div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    3D Manufacturing Format - Modern format with full color and texture support
                  </p>
                </div>
                <div className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <div className="text-lg">.STEP/.STP</div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Standard for the Exchange of Product Data - CAD native format
                  </p>
                </div>
              </div>
              <Alert className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Maximum file size: 50MB per file. For larger files, please contact us.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Model Requirements */}
          <Card>
            <CardHeader>
              <CardTitle>Model Requirements</CardTitle>
              <CardDescription>
                Your 3D model must meet these technical requirements
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="mb-1">Manifold (Watertight) Mesh</div>
                  <p className="text-sm text-muted-foreground">
                    Model must be a closed volume with no holes, gaps, or non-manifold edges. Use mesh repair tools if needed.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="mb-1">Correct Scale and Units</div>
                  <p className="text-sm text-muted-foreground">
                    Ensure your model is scaled correctly. Export in millimeters for best results. We can adjust if needed.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="mb-1">Consistent Normals</div>
                  <p className="text-sm text-muted-foreground">
                    All face normals should point outward. Inverted normals can cause slicing errors.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="mb-1">No Intersecting Geometry</div>
                  <p className="text-sm text-muted-foreground">
                    Avoid overlapping or intersecting surfaces. These can cause unpredictable results.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Design Guidelines */}
          <Card>
            <CardHeader>
              <CardTitle>Design Guidelines</CardTitle>
              <CardDescription>
                Follow these design principles for successful 3D prints
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="mb-3">Wall Thickness</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between p-2 bg-muted rounded">
                    <span>FDM Minimum</span>
                    <Badge>1.5mm</Badge>
                  </div>
                  <div className="flex justify-between p-2 bg-muted rounded">
                    <span>FDM Recommended</span>
                    <Badge>2-3mm</Badge>
                  </div>
                  <div className="flex justify-between p-2 bg-muted rounded">
                    <span>Resin Minimum</span>
                    <Badge>0.8mm</Badge>
                  </div>
                  <div className="flex justify-between p-2 bg-muted rounded">
                    <span>Resin Recommended</span>
                    <Badge>1-2mm</Badge>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="mb-3">Overhangs and Bridges</h3>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-1" />
                    <div className="text-sm">
                      <strong>Good:</strong> Overhangs up to 45° can print without supports
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-orange-500 mt-1" />
                    <div className="text-sm">
                      <strong>Caution:</strong> 45-70° overhangs may need supports
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <XCircle className="w-4 h-4 text-red-500 mt-1" />
                    <div className="text-sm">
                      <strong>Avoid:</strong> Overhangs greater than 70° require supports
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="mb-3">Detail Resolution</h3>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div className="border rounded-lg p-3">
                    <div className="mb-2">FDM Printing</div>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>• Minimum feature: 1mm</li>
                      <li>• Layer height: 0.1-0.3mm</li>
                      <li>• Best for: functional parts</li>
                    </ul>
                  </div>
                  <div className="border rounded-lg p-3">
                    <div className="mb-2">Resin Printing</div>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>• Minimum feature: 0.3mm</li>
                      <li>• Layer height: 0.025-0.1mm</li>
                      <li>• Best for: detailed models</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="mb-3">Clearances and Tolerances</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between p-2 bg-muted rounded">
                    <span>Snap-fit clearance (FDM)</span>
                    <Badge>0.3-0.5mm</Badge>
                  </div>
                  <div className="flex justify-between p-2 bg-muted rounded">
                    <span>Sliding fit (FDM)</span>
                    <Badge>0.2-0.3mm</Badge>
                  </div>
                  <div className="flex justify-between p-2 bg-muted rounded">
                    <span>Press fit (FDM)</span>
                    <Badge>-0.1-0.1mm</Badge>
                  </div>
                  <div className="flex justify-between p-2 bg-muted rounded">
                    <span>Resin tolerances</span>
                    <Badge>±0.1mm</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Common Issues */}
          <Card>
            <CardHeader>
              <CardTitle>Common Issues & Solutions</CardTitle>
              <CardDescription>
                How to fix typical 3D modeling problems
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-l-4 border-red-500 pl-4">
                <div className="flex items-start gap-2 mb-2">
                  <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong>Problem: Non-Manifold Edges</strong>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground ml-7">
                  <strong>Solution:</strong> Use Meshmixer, Netfabb, or your CAD software's repair tools to fix mesh errors. Most slicers can also auto-repair minor issues.
                </p>
              </div>

              <div className="border-l-4 border-orange-500 pl-4">
                <div className="flex items-start gap-2 mb-2">
                  <AlertCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong>Problem: Thin Walls</strong>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground ml-7">
                  <strong>Solution:</strong> Increase wall thickness to at least 1.5mm (FDM) or 0.8mm (Resin). Consider using a shell instead of solid fill for large parts.
                </p>
              </div>

              <div className="border-l-4 border-orange-500 pl-4">
                <div className="flex items-start gap-2 mb-2">
                  <AlertCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong>Problem: Large Overhangs</strong>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground ml-7">
                  <strong>Solution:</strong> Reorient your model to minimize overhangs, or accept support structures. Consider splitting the model into multiple parts.
                </p>
              </div>

              <div className="border-l-4 border-orange-500 pl-4">
                <div className="flex items-start gap-2 mb-2">
                  <AlertCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong>Problem: File Too Large</strong>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground ml-7">
                  <strong>Solution:</strong> Reduce polygon count in your 3D software, or use tools like Meshmixer to decimate the mesh while preserving detail.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Software Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle>Recommended Software</CardTitle>
              <CardDescription>
                Tools for creating and repairing 3D models
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <div className="mb-2">Mesh Repair</div>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <div>Meshmixer (Free)</div>
                    <div>Netfabb (Pro)</div>
                    <div>3D Builder (Free)</div>
                  </div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="mb-2">3D Modeling</div>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <div>Fusion 360</div>
                    <div>Blender (Free)</div>
                    <div>TinkerCAD (Free)</div>
                  </div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="mb-2">File Checking</div>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <div>PrusaSlicer (Free)</div>
                    <div>Cura (Free)</div>
                    <div>Online validators</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Help Section */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Need Help?</strong> Our team can review your files before printing and suggest optimizations.
              File preparation service available for $25-75 depending on complexity.
            </AlertDescription>
          </Alert>
        </div>
      </section>
    </div>
  );
}
