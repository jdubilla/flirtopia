//
//  MainPhotoView.swift
//  flirtopia
//
//  Created by Jean-baptiste DUBILLARD on 24/02/2024.
//

//import SwiftUI
//import PhotosUI

//struct MainPhotoView: View {
//    
////    @State private var avatarItem: PhotosPickerItem?
//    @State private var avatarImage: Image?
//    
//    @StateObject var vm = MainPhotoViewModel()
//    
//    var body: some View {
//        VStack {
//            Text("Add a main photo")
//                .font(.largeTitle)
//            
//            PhotosPicker("Select your main photo", selection: $avatarItem, matching: .images)
//
//            avatarImage?
//                .resizable()
//                .scaledToFit()
//                .frame(width: 300, height: 300)
//            
//            Button(action: {
//                
//                guard let image = avatarImage else {
//                    return
//                }
//                
//                let uiImage: UIImage = image.asUIImage()
//                let imageData: Data = uiImage.jpegData(compressionQuality: 0.1) ?? Data()
//                let imageStr: String = imageData.base64EncodedString()
//                
//            }, label: {
//                Text("Next")
//                    .padding(EdgeInsets(top: 15, leading: 50, bottom: 15, trailing: 50))
//                    .frame(maxWidth: 250)
//                    .background(
//                        LinearGradient(gradient: Gradient(colors: [Color(hex: 0xCF0CB5), Color(hex: 0xFD5E64), Color(hex: 0xFEEB0B)]), startPoint: .leading, endPoint: .trailing)
//                    )
//                    .clipShape(RoundedRectangle(cornerRadius: 20))
//                    .foregroundStyle(.white)
//                    .fontWeight(.bold)
//                    .font(.system(size: 24))
//                    .padding(.top, 40)
//            })
//
//        }
//        .onChange(of: avatarItem) {
//            Task {
//                if let loaded = try? await avatarItem?.loadTransferable(type: Image.self) {
//                    avatarImage = loaded
//                } else {
//                    print("Failed")
//                }
//            }
//        }
//    }
//}

//struct MainPhotoView: View {
//    
//    @State var showImagePicker: Bool = false
//    @State var selectedImage: Image? = nil
//    
//    var body: some View {
//        VStack {
//            Button {
//                self.showImagePicker.toggle()
//            } label: {
//                Text("Select image")
//            }
//            
//            self.selectedImage?.resizable().scaledToFit()
//            
//            Button(action: {
//                guard let image = self.selectedImage else {
//                    return
//                }
//                let uiImage: UIImage = image.asUIImage()
//                let imageData: Data = uiImage.jpegData(compressionQuality: 0.1) ?? Data()
//                let imageStr: String = imageData.base64EncodedString()
//                
//                let url = URL(string: "http://localhost:3000/uploads")!
//                
//                
//                let paramStr: String = "image=\(imageStr)"
//                let paramData: Data = paramStr.data(using: .utf8) ?? Data()
//                print(paramData)
//                
//                print("3")
//                
//                var urlRequest = URLRequest(url: url)
//                
//                urlRequest.httpMethod = "POST"
//                urlRequest.httpBody = paramData
//                urlRequest.setValue("application/x-www-form-urlencoded", forHTTPHeaderField: "Content-Type")
//                
//                guard let token = KeychainManager().getTokenFromKeychain() else {
//                    return
//                }
//                urlRequest.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
//                
//                print("4")
//                URLSession.shared.dataTask(with: urlRequest, completionHandler: {
//                    (data, error, response) in
//                    guard let data = data else {
//                        print("Invalid Data")
//                        return
//                    }
//                    
//                    let responseStr: String = String(data: data, encoding: .utf8) ?? ""
//                    print(responseStr)
//                }).resume()
//            }, label: {
//                Text("Upload image")
//            })
//            
//        }.sheet(isPresented: $showImagePicker, content: {
//            ImagePicker(image: self.$selectedImage)
//        })
//    }
//}
//
//
//#Preview {
//    MainPhotoView()
//}
//
//extension View {
//    public func asUIImage() -> UIImage {
//        let controller = UIHostingController(rootView: self)
//         
//        controller.view.frame = CGRect(x: 0, y: CGFloat(Int.max), width: 1, height: 1)
//        UIApplication.shared.windows.first!.rootViewController?.view.addSubview(controller.view)
//         
//        let size = controller.sizeThatFits(in: UIScreen.main.bounds.size)
//        controller.view.bounds = CGRect(origin: .zero, size: size)
//        controller.view.sizeToFit()
//         
//        let image = controller.view.asUIImage()
//        controller.view.removeFromSuperview()
//        return image
//    }
//}
// 
//extension UIView {
//    public func asUIImage() -> UIImage {
//        let renderer = UIGraphicsImageRenderer(bounds: bounds)
//        return renderer.image { rendererContext in
//            layer.render(in: rendererContext.cgContext)
//        }
//    }
//}
// 
//struct ImagePicker: UIViewControllerRepresentable {
// 
//    @Environment(\.presentationMode)
//    var presentationMode
// 
//    @Binding var image: Image?
// 
//    class Coordinator: NSObject, UINavigationControllerDelegate, UIImagePickerControllerDelegate {
// 
//        @Binding var presentationMode: PresentationMode
//        @Binding var image: Image?
// 
//        init(presentationMode: Binding<PresentationMode>, image: Binding<Image?>) {
//            _presentationMode = presentationMode
//            _image = image
//        }
// 
//        func imagePickerController(_ picker: UIImagePickerController,
//                                   didFinishPickingMediaWithInfo info: [UIImagePickerController.InfoKey : Any]) {
//            let uiImage = info[UIImagePickerController.InfoKey.originalImage] as! UIImage
//            image = Image(uiImage: uiImage)
//            presentationMode.dismiss()
// 
//        }
// 
//        func imagePickerControllerDidCancel(_ picker: UIImagePickerController) {
//            presentationMode.dismiss()
//        }
// 
//    }
// 
//    func makeCoordinator() -> Coordinator {
//        return Coordinator(presentationMode: presentationMode, image: $image)
//    }
// 
//    func makeUIViewController(context: UIViewControllerRepresentableContext<ImagePicker>) -> UIImagePickerController {
//        let picker = UIImagePickerController()
//        picker.delegate = context.coordinator
//        return picker
//    }
// 
//    func updateUIViewController(_ uiViewController: UIImagePickerController,
//                                context: UIViewControllerRepresentableContext<ImagePicker>) {
// 
//    }
// 
//}



