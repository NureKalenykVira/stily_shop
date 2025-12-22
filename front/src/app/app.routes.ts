import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { ProductsComponent } from './pages/products/products.component';
import { CartComponent } from './pages/cart/cart.component';
import { ProductDetailsComponent } from './pages/product-details/product-details.component';
import { ContactsComponent } from './pages/contacts/contacts.component';
import { PaymentComponent } from './pages/payment/payment.component';
import { DeliveryComponent } from './pages/delivery/delivery.component';
import { ReturnsComponent } from './pages/returns/returns.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { AccountComponent } from './pages/account/account.component';
import { AccountPanelComponent } from './pages/account/account-panel/account-panel.component';
import { ContactInfoComponent } from './pages/account/contact-info/contact-info.component';
import { AddressesComponent } from './pages/account/addresses/addresses.component';
import { OrdersComponent } from './pages/account/orders/orders.component';
import { ChangePasswordComponent } from './pages/account/change-password/change-password.component';
import { FavoritesComponent } from './pages/favorites/favorites.component';
import { CheckoutAuthComponent } from './pages/checkout-auth/checkout-auth.component';
import { CheckoutDeliveryComponent } from './pages/checkout-delivery/checkout-delivery.component';
import { CheckoutPaymentComponent } from './pages/checkout-payment/checkout-payment.component';
import { CheckoutSuccessComponent } from './pages/checkout-success/checkout-success.component';
import { AdminLayoutComponent } from './pages/admin/admin-layout/admin-layout.component';
import { ProductsComponent as AdminProductsComponent } from './pages/admin/products/products.component';
import { CustomersComponent as AdminCustomersComponent } from './pages/admin/customers/customers.component';
import { OrdersComponent as AdminOrdersComponent } from './pages/admin/orders/orders.component';
import { AnalyticsComponent as AdminAnalyticsComponent } from './pages/admin/analytics/analytics.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'products', component: ProductsComponent },
  { path: 'products/:id', component: ProductDetailsComponent },
  { path: 'cart', component: CartComponent },
  { path: 'contacts', component: ContactsComponent },
  { path: 'payment', component: PaymentComponent },
  { path: 'delivery', component: DeliveryComponent },
  { path: 'returns', component: ReturnsComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  {
    path: 'account',
    component: AccountComponent,
    children: [
      { path: '', component: AccountPanelComponent },
      { path: 'contact', component: ContactInfoComponent },
      { path: 'addresses', component: AddressesComponent },
      { path: 'orders', component: OrdersComponent },
      { path: 'password', component: ChangePasswordComponent },
    ]
  },
  { path: 'favorites', component: FavoritesComponent },
  { path: 'checkout-auth', component: CheckoutAuthComponent },
  { path: 'checkout-delivery', component: CheckoutDeliveryComponent },
  { path: 'checkout-payment', component: CheckoutPaymentComponent },
  { path: 'checkout-success', component: CheckoutSuccessComponent },
   {
    path: 'admin',
    component: AdminLayoutComponent,
    data: { hideHeader: true },
    children: [
      { path: '', redirectTo: 'products', pathMatch: 'full' },
      { path: 'products', component: AdminProductsComponent },
      { path: 'customers', component: AdminCustomersComponent },
      { path: 'orders', component: AdminOrdersComponent },
      { path: 'analytics', component: AdminAnalyticsComponent },
    ]
  },
];
