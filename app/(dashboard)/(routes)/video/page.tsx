"use client";

import * as z from "zod";
import axios from "axios";
import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { FileAudio } from "lucide-react";
import { useRouter } from "next/navigation";

import { Heading } from "@/components/heading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Loader } from "@/components/loader";
import { Empty } from "@/components/ui/empty";
import { useProModal } from "@/hooks/use-pro-modal";
import { useReplicatePrediction } from "@/hooks/use-replicate-prediction";

import { formSchema } from "./constants";

const VideoPage = () => {
  const router = useRouter();
  const proModal = useProModal();
  const [video, setVideo] = useState<string>();
  const [predictionId, setPredictionId] = useState<string | null>(null);
  const { prediction, isLoading: isPredictionLoading } = useReplicatePrediction(predictionId);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: "",
    }
  });

  const isLoading = form.formState.isSubmitting || isPredictionLoading;

  // Handle prediction completion
  useEffect(() => {
    if (prediction?.status === 'succeeded' && prediction.output) {
      setVideo(prediction.output[0]);
      toast.success("Video generated successfully!");
    } else if (prediction?.status === 'failed') {
      toast.error("Video generation failed. Please try again.");
    }
  }, [prediction]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setVideo(undefined);
      setPredictionId(null);

      const response = await axios.post('/api/video', values);
      setPredictionId(response.data.id);
      
      form.reset();
    } catch (error: any) {
      if (error?.response?.status === 403) {
        proModal.onOpen();
      } else {
        toast.error("Something went wrong.");
      }
    } finally {
      router.refresh();
    }
  }

  return ( 
    <div>
      <Heading
        title="Video Generation"
        description="Turn your prompt into video."
        icon={FileAudio}
        iconColor="text-orange-700"
        bgColor="bg-orange-700/10"
      />
      <div className="px-4 lg:px-8">
        <Form {...form}>
          <form 
            onSubmit={form.handleSubmit(onSubmit)} 
            className="
              rounded-lg 
              border 
              w-full 
              p-4 
              px-3 
              md:px-6 
              focus-within:shadow-sm
              grid
              grid-cols-12
              gap-2
            "
          >
            <FormField
              name="prompt"
              render={({ field }) => (
                <FormItem className="col-span-12 lg:col-span-10">
                  <FormControl className="m-0 p-0">
                    <Input
                      className="border-0 outline-none focus-visible:ring-0 focus-visible:ring-transparent"
                      disabled={isLoading} 
                      placeholder="Clown fish swimming in a coral reef" 
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <Button className="col-span-12 lg:col-span-2 w-full" type="submit" disabled={isLoading} size="icon">
              Generate
            </Button>
          </form>
        </Form>
        {isLoading && (
          <div className="p-20">
            <Loader />
            {prediction && (
              <p className="text-center text-sm text-muted-foreground mt-4">
                Status: {prediction.status === 'starting' ? 'Initializing...' : 
                        prediction.status === 'processing' ? 'Generating video...' : 
                        'Processing...'}
              </p>
            )}
          </div>
        )}
        {!video && !isLoading && (
          <Empty label="No video files generated." />
        )}
        {video && (
          <video controls className="w-full aspect-video mt-8 rounded-lg border bg-black">
            <source src={video} />
          </video>
        )}
      </div>
    </div>
   );
}
 
export default VideoPage;
